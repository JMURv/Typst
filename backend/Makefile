migrate:
	poetry run python manage.py makemigrations
	poetry run python manage.py migrate

start:
	poetry run python manage.py runserver localhost:8000

test:
	poetry run python manage.py test

shell:
	poetry run python manage.py shell

static:
	python manage.py collectstatic --noinput --clear

reset:
	poetry run python manage.py flush

create_users:
	poetry run python manage.py create_users