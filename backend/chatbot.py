import os
from typing import Any, Dict, Optional, TypedDict

from dotenv import load_dotenv
from google import genai
from langgraph.graph import END, StateGraph
from sqlalchemy.orm import Session

import models


class ChatState(TypedDict, total=False):
    message: str
    user_type: str
    user_name: str
    db: Session
    intent: str
    context: str
    draft_reply: str
    final_reply: str


_compiled_graph = None


def _get_client() -> genai.Client:
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    return genai.Client(api_key=api_key)


def _call_llm(prompt: str) -> str:
    client = _get_client()
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    return (response.text or "").strip()


def _intent_node(state: ChatState) -> ChatState:
    message = state.get("message", "")
    prompt = (
        "Classify user intent into one label only: internship_search, profile_help, "
        "platform_help, general_qa. Return only the label.\n\n"
        f"Message: {message}"
    )
    raw_intent = _call_llm(prompt).lower()
    allowed = {"internship_search", "profile_help", "platform_help", "general_qa"}
    intent = raw_intent if raw_intent in allowed else "general_qa"
    return {"intent": intent}


def _context_node(state: ChatState) -> ChatState:
    intent = state.get("intent", "general_qa")
    db = state.get("db")
    user_type = state.get("user_type", "user")
    user_name = state.get("user_name", "User")

    if db is None:
        return {"context": f"User: {user_name} ({user_type})."}

    internships_count = db.query(models.Internship).count()
    student_count = db.query(models.Student).count()
    teacher_count = db.query(models.Teacher).count()

    context = (
        f"User: {user_name} ({user_type}). "
        f"Platform snapshot: {internships_count} internships, {student_count} students, {teacher_count} teachers. "
        f"Detected intent: {intent}."
    )

    if intent == "internship_search":
        latest = db.query(models.Internship).order_by(models.Internship.created_at.desc()).first()
        if latest:
            context += (
                f" Latest internship: '{latest.title}' at '{latest.company_name or 'Unknown company'}'."
            )

    return {"context": context}


def _generation_node(state: ChatState) -> ChatState:
    message = state.get("message", "")
    context = state.get("context", "")
    intent = state.get("intent", "general_qa")

    prompt = (
        "You are InternConnect assistant. Keep response practical and short. "
        "If user asks for app guidance, provide clear steps. "
        "Do not invent unsupported features.\n\n"
        f"Context: {context}\n"
        f"Intent: {intent}\n"
        f"User message: {message}"
    )
    draft = _call_llm(prompt)
    return {"draft_reply": draft}


def _finalize_node(state: ChatState) -> ChatState:
    draft = state.get("draft_reply", "").strip()
    if not draft:
        draft = "I could not generate a response right now. Please try again."

    final_reply = draft[:1500]
    return {"final_reply": final_reply}


def _build_graph():
    graph = StateGraph(ChatState)

    graph.add_node("intent", _intent_node)
    graph.add_node("context", _context_node)
    graph.add_node("generate", _generation_node)
    graph.add_node("finalize", _finalize_node)

    graph.set_entry_point("intent")
    graph.add_edge("intent", "context")
    graph.add_edge("context", "generate")
    graph.add_edge("generate", "finalize")
    graph.add_edge("finalize", END)

    return graph.compile()


def get_langgraph_response(message: str, current_user: Any, db: Session) -> str:
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = _build_graph()

    user_name = f"{getattr(current_user, 'first_name', '')} {getattr(current_user, 'last_name', '')}".strip()
    user_type = getattr(current_user, "type", "user")

    result: Dict[str, Any] = _compiled_graph.invoke(
        {
            "message": message,
            "user_type": user_type,
            "user_name": user_name or "User",
            "db": db,
        }
    )
    return str(result.get("final_reply", "I could not generate a response right now."))
