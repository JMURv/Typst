db:
	poetry run python manage.py makemigrations
	poetry run python manage.py migrate

start:
	poetry run python manage.py runserver localhost:8000

test:
	poetry run python manage.py test

lint:
	poetry run flake8 .

shell:
	poetry run python manage.py shell

static:
	python manage.py collectstatic --noinput --clear

reset:
	poetry run python manage.py flush

configure:
	poetry run python manage.py conf_site

create_users:
	poetry run python manage.py create_users

zodiac:
	poetry run python manage.py create_zodiac

tags:
	poetry run python manage.py create_tags

subs:
	poetry run python manage.py create_subs
