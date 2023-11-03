from .textcomp import SimilarUsersBio
from .imagecomp import CompImages


class RecSystem:
    def find_similar_by_user(self, current_user: dict, users_list: list[dict]) -> list:
        users_dict = {}
        for dict_el in users_list:
            users_dict[dict_el['id']] = dict_el
        SimilarUsersBio.process_text(users_dict)
        similar_by_user = SimilarUsersBio.find_similarity(
            current_user,
            users_dict
        )
        return similar_by_user

    def find_similar_text_for_all(self, users: list):
        users_dict = {}
        for user in users:
            users_dict[user['id']] = user
        SimilarUsersBio.process_text(users_dict)
        similarities = SimilarUsersBio.find_similarity_for_all(users_dict)
        return similarities

    def compare_images(self, path_to_image1: str, path_to_image2: str) -> bool:
        return CompImages.comapre(path_to_image1, path_to_image2)

    def find_median_image(self, paths_to_images: list):
        CompImages.mean_face_image(paths_to_images)


RS = RecSystem()
