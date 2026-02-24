class UserScopedQuerySetMixin:
    user_field = "user"

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)

        if user is None or not user.is_authenticated:
            return qs.none()

        return qs.filter(**{self.user_field: user})
