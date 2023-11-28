import base64
import os
from rest_framework import serializers
from users.models import UserMedia


class MediaFileSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    relative_path = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    def get_type(self, instance):
        file_name, file_ext = os.path.splitext(instance.file.name)
        file_ext = file_ext.strip('.')
        if file_ext in ('png', 'jpg', 'jpeg'):
            return f"image/{file_ext}"
        elif file_ext in ('mp4', 'avi'):
            return f"video/{file_ext}"
        else:
            return f"file/{file_ext}"

    def get_relative_path(self, instance):
        file_path = instance.file.url
        return file_path

    def get_file_name(self, instance):
        file_name = instance.file.name
        file_name = file_name.split('/')[-1]
        return file_name

    class Meta:
        model = UserMedia
        fields = [
            'id',
            "type",
            "relative_path",
            "file_name",
            "created_at",
        ]


class MediaFileBytesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMedia
        fields = [
            'file',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['file'] = self.get_media_file_bytes(instance.file)
        return data

    def get_media_file_bytes(self, media_file):
        with open(media_file.path, 'rb') as file:
            bytes_data = file.read()
            return base64.b64encode(bytes_data).decode('utf-8')
