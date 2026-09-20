"""Seed repeatable demo teachers, profile images, and internships."""

from datetime import date, datetime, timedelta
from pathlib import Path
import argparse

from PIL import Image
from sqlalchemy.orm import Session

import models
from database import SessionLocal
from storage import upload_profile_image
from utils import hash


TEACHERS = [
    ("Aarav", "Sharma", "aarav.sharma@internconnect.demo", "Computer Science", date(2019, 7, 1)),
    ("Ishita", "Patel", "ishita.patel@internconnect.demo", "Information Technology", date(2020, 1, 15)),
    ("Rohan", "Mehta", "rohan.mehta@internconnect.demo", "Electronics", date(2018, 8, 20)),
    ("Ananya", "Singh", "ananya.singh@internconnect.demo", "Business Administration", date(2021, 2, 10)),
    ("Kabir", "Gupta", "kabir.gupta@internconnect.demo", "Data Science", date(2019, 11, 5)),
    ("Meera", "Nair", "meera.nair@internconnect.demo", "Design", date(2022, 6, 1)),
    ("Vihaan", "Reddy", "vihaan.reddy@internconnect.demo", "Mechanical Engineering", date(2017, 9, 12)),
    ("Diya", "Joshi", "diya.joshi@internconnect.demo", "Cybersecurity", date(2020, 10, 26)),
    ("Arjun", "Kapoor", "arjun.kapoor@internconnect.demo", "Cloud Computing", date(2018, 4, 18)),
]


INTERNSHIPS = [
    ("Software Engineering Intern", "Google", "Mountain View, CA", True, ["Python", "Distributed Systems", "Git"], 12),
    ("Frontend Engineering Intern", "Microsoft", "Redmond, WA", True, ["React", "TypeScript", "Azure"], 12),
    ("Product Design Intern", "Adobe", "San Jose, CA", True, ["Figma", "UI/UX", "Design Systems"], 10),
    ("Cloud Engineering Intern", "Amazon Web Services", "Seattle, WA", True, ["AWS", "Linux", "Terraform"], 12),
    ("Data Science Intern", "Meta", "Menlo Park, CA", True, ["Python", "SQL", "Machine Learning"], 12),
    ("iOS Software Intern", "Apple", "Cupertino, CA", False, ["Swift", "iOS", "Xcode"], 12),
    ("Machine Learning Intern", "NVIDIA", "Santa Clara, CA", True, ["Python", "PyTorch", "CUDA"], 16),
    ("Backend Developer Intern", "IBM", "Austin, TX", True, ["Java", "REST APIs", "PostgreSQL"], 12),
    ("Platform Engineering Intern", "Salesforce", "San Francisco, CA", True, ["Java", "Kubernetes", "Docker"], 12),
    ("Security Engineering Intern", "Cisco", "San Jose, CA", True, ["Networking", "Python", "Security"], 12),
    ("Software Developer Intern", "Oracle", "Austin, TX", True, ["Java", "SQL", "Cloud"], 12),
    ("UX Research Intern", "Atlassian", "Remote", True, ["User Research", "Figma", "Prototyping"], 10),
    ("Quantitative Developer Intern", "Bloomberg", "New York, NY", False, ["C++", "Algorithms", "Finance"], 10),
    ("DevOps Intern", "Deloitte", "Chicago, IL", True, ["CI/CD", "Docker", "AWS"], 12),
    ("Mobile Developer Intern", "Uber", "San Francisco, CA", True, ["Kotlin", "Android", "REST APIs"], 12),
    ("Research Engineering Intern", "OpenAI", "San Francisco, CA", True, ["Python", "Machine Learning", "Research"], 16),
    ("Full Stack Engineering Intern", "Spotify", "New York, NY", True, ["React", "Node.js", "PostgreSQL"], 12),
    ("Hardware Engineering Intern", "Tesla", "Palo Alto, CA", False, ["Embedded Systems", "C++", "Electronics"], 16),
    ("Business Analyst Intern", "McKinsey & Company", "Boston, MA", False, ["Excel", "Analytics", "Communication"], 10),
    ("Marketing Technology Intern", "HubSpot", "Cambridge, MA", True, ["Marketing", "Analytics", "CRM"], 10),
]


def _save_profile_image(image_path: Path, user_id: int) -> None:
    with Image.open(image_path) as image:
        output = image.convert("RGB")
        from io import BytesIO

        buffer = BytesIO()
        output.save(buffer, format="JPEG")
        upload_profile_image(f"user_{user_id}.jpeg", buffer.getvalue())


def seed(images_dir: Path) -> None:
    image_paths = sorted(images_dir.glob("image*"))
    if len(image_paths) < len(TEACHERS):
        raise ValueError(f"Expected at least {len(TEACHERS)} images in {images_dir}, found {len(image_paths)}")

    db: Session = SessionLocal()
    try:
        teachers = []
        for index, (first_name, last_name, email, department, start_date) in enumerate(TEACHERS):
            teacher = db.query(models.Teacher).filter(models.User.email == email).first()
            if teacher is None:
                teacher = models.Teacher(
                    email=email,
                    password=hash("vaib@1603"),
                    first_name=first_name,
                    last_name=last_name,
                    type="teacher",
                    department=department,
                    start_date=start_date,
                )
                db.add(teacher)
                db.flush()
            teachers.append(teacher)
            _save_profile_image(image_paths[index], teacher.id)

        now = datetime.utcnow()
        for index, (title, company, location, is_remote, skills, duration_weeks) in enumerate(INTERNSHIPS):
            exists = (
                db.query(models.Internship)
                .filter(
                    models.Internship.title == title,
                    models.Internship.company_name == company,
                )
                .first()
            )
            if exists:
                continue

            teacher = teachers[index % len(teachers)]
            db.add(
                models.Internship(
                    title=title,
                    description=(
                        f"Join the {company} team as a {title.lower()}. "
                        "Work with experienced professionals on meaningful projects and build practical industry skills."
                    ),
                    application_link=f"https://careers.{company.lower().replace(' ', '').replace('&', '')}.com/internships",
                    company_name=company,
                    location=location,
                    is_remote=is_remote,
                    skills_required=skills,
                    duration_weeks=duration_weeks,
                    deadline=now + timedelta(days=45 + index),
                    created_at=now - timedelta(days=index),
                    is_active=True,
                    teacher_id=teacher.teacher_id,
                )
            )

        db.commit()
        print(f"Seeded {len(teachers)} teachers and {len(INTERNSHIPS)} internships.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--images-dir",
        type=Path,
        default=Path(r"C:\Users\parth\Pictures\Images"),
    )
    seed(parser.parse_args().images_dir)
