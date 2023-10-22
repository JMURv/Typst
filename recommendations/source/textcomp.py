import logging
import numpy as np
import nltk
from nltk import PorterStemmer
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import string


class SimilarUsersByBio:
    def __init__(self):
        logging.basicConfig()

    def compute_similarity(self, text1, text2, word_embeddings):
        vectors1 = [
            word_embeddings.get(word, np.zeros(word_embeddings.vector_size))
            for word in text1.split()
        ]
        vectors2 = [
            word_embeddings.get(word, np.zeros(word_embeddings.vector_size))
            for word in text2.split()
        ]

        if not vectors1 or not vectors2:
            return 0.0

        vectors1 = np.array(vectors1)
        vectors2 = np.array(vectors2)

        similarity_matrix = cosine_similarity([vectors1], [vectors2])

        return similarity_matrix[0][0]

    def find_similarity(self, current_user: dict, users_dict: dict) -> list:
        user_texts = [
            user['about'] for user in users_dict.values()
            if user.get('about', None) is not None
        ]
        user_texts.append(current_user.get('about', ''))

        vectorizer = TfidfVectorizer()
        X = vectorizer.fit_transform(user_texts)
        similarity_matrix = cosine_similarity(X)

        similarity_scores = similarity_matrix[-1][:-1]
        similar_users = []
        for user_id, score in zip(users_dict.keys(), similarity_scores):
            similar_users.append({
                'id': user_id,
                'similarity_score': score
            })
        similar_users = sorted(similar_users, key=lambda x: x['similarity_score'], reverse=True)
        return [user.get('id') for user in similar_users[:20]]

    def find_similarity_for_all(self, users_hobbies):
        user_names = list(users_hobbies.keys())
        user_texts = [user['bio'] for user in users_hobbies.values()]

        vectorizer = TfidfVectorizer()
        X = vectorizer.fit_transform(user_texts)
        similarity_matrix = cosine_similarity(X)

        similar_users = {}

        for selected_user_index in range(len(user_names)):
            selected_user = user_names[selected_user_index]
            similar_user_indices = []

            for i, user in enumerate(users_hobbies.values()):
                if i == selected_user_index:
                    continue

                similar_user_indices.append(i)

            similar_user_indices = sorted(
                similar_user_indices,
                key=lambda i: similarity_matrix[selected_user_index, i],
                reverse=True
            )[:5]

            similar_users[selected_user] = [user_names[i] for i in similar_user_indices]
        return similar_users

    def process_text(self, users_data):
        for k, v in users_data.items():
            about = users_data[k]['about']
            if isinstance(about, str) and len(about) > 0:
                processed_about = self.nlp(about)
                if processed_about:
                    users_data[k]['about'] = processed_about
        return users_data

    def nlp(self, about: str):
        tokens = nltk.word_tokenize(about)
        stop_words = set(stopwords.words('russian'))
        extra_stop_words = [
            'это', 'который', 'лет', 'хочу', 'работаю м', 'очень', 'нравится', '-', 'просто', 'жизнь',
            'жизни', 'могу', 'ищу', 'люблю', 'обожаю', 'регулярно', 'фанат', 'свой', 'занимаюсь',
            'играю', 'фанат', 'изучаю', 'свободное', 'человек'
        ]
        stop_words = stop_words.union(extra_stop_words)

        translator = str.maketrans('', '', string.punctuation)

        filtered_tokens = [word for word in tokens if word.lower() not in stop_words and word.isalpha()]

        stemmer = PorterStemmer()
        stemmed_tokens = [stemmer.stem(word) for word in filtered_tokens]

        processed_text = ' '.join(stemmed_tokens)

        return processed_text


SimilarUsersBio = SimilarUsersByBio()
