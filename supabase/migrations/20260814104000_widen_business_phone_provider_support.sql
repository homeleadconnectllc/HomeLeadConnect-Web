alter table public.business_phone_numbers drop constraint if exists business_phone_numbers_provider_type_check;

alter table public.business_phone_numbers add constraint business_phone_numbers_provider_type_check
check (provider_type ~ '^[a-z0-9][a-z0-9_-]{1,63}$');
