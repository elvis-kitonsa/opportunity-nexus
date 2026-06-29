from django.contrib import admin

from . import models


@admin.action(description="Mark selected employers as verified")
def verify_employers(_modeladmin, _request, queryset):
    queryset.update(is_verified=True)


@admin.action(description="Publish selected job listings")
def publish_jobs(_modeladmin, _request, queryset):
    queryset.update(status=models.JobStatus.PUBLISHED)


@admin.action(description="Reject selected job listings")
def reject_jobs(_modeladmin, _request, queryset):
    queryset.update(status=models.JobStatus.REJECTED)


@admin.register(models.Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ("name", "email_domain", "location", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "email_domain")
    list_editable = ("is_active",)


@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "is_active", "is_verified")
    list_filter = ("role", "is_active", "is_verified")
    search_fields = ("email",)
    # Never expose the password hash for editing.
    exclude = ("hashed_password",)
    readonly_fields = ("email", "role")


class SeekerSkillInline(admin.TabularInline):
    model = models.SeekerSkill
    extra = 0
    autocomplete_fields = ("skill",)


@admin.register(models.SeekerProfile)
class SeekerProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "institution", "field_of_study", "graduation_year", "is_institution_verified")
    list_filter = ("is_institution_verified", "institution")
    search_fields = ("full_name", "field_of_study")
    inlines = (SeekerSkillInline,)
    autocomplete_fields = ("user", "institution")


@admin.register(models.EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ("company_name", "location", "is_verified")
    list_filter = ("is_verified",)
    search_fields = ("company_name",)
    actions = (verify_employers,)
    autocomplete_fields = ("user",)


@admin.register(models.Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "category")
    search_fields = ("name", "slug")


class JobSkillInline(admin.TabularInline):
    model = models.JobSkill
    extra = 0
    autocomplete_fields = ("skill",)


@admin.register(models.Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "employer", "location", "employment_type", "experience_level", "status")
    list_filter = ("status", "employment_type", "experience_level")
    search_fields = ("title",)
    inlines = (JobSkillInline,)
    actions = (publish_jobs, reject_jobs)
    autocomplete_fields = ("employer",)


@admin.register(models.Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("__str__", "job", "seeker", "status", "match_score")
    list_filter = ("status",)
    autocomplete_fields = ("job", "seeker")
    readonly_fields = ("match_score",)
