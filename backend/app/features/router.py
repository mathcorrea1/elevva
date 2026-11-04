from fastapi import APIRouter
from .identity.router import router as identity_router
from .students.router import router as students_router
from .assessments.router import router as assessments_router
from .catalog.router import router as catalog_router
from .activities.router import router as activities_router
from .reports.router import router as reports_router
from .classrooms.router import router as classrooms_router
from .feedback.router import router as feedback_router
from .catalog.guidance import router as guidance_router
from .students.attention import router as attention_router
from .activities.journey import router as journey_router
from .trails.router import router as trails_router
from .trails.media import router as media_router
from .students.care import router as care_router
from .reports.overview import router as overview_router
from .lessons.router import router as lessons_router
from .lessons.player import router as lesson_player_router
from .students.management import router as student_management_router
from .lessons.drafts import router as lesson_drafts_router

router = APIRouter()
router.include_router(identity_router)
router.include_router(student_management_router)
router.include_router(students_router)
router.include_router(assessments_router)
router.include_router(catalog_router)
router.include_router(activities_router)
router.include_router(reports_router)
router.include_router(classrooms_router)
router.include_router(feedback_router)
router.include_router(guidance_router)
router.include_router(attention_router)
router.include_router(journey_router)
router.include_router(trails_router)
router.include_router(media_router)
router.include_router(care_router)
router.include_router(overview_router)
router.include_router(lessons_router)
router.include_router(lesson_player_router)
router.include_router(lesson_drafts_router)
