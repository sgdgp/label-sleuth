import logging
import re
import string

from collections import defaultdict
from enum import Enum

from lrtc_lib.models.core.languages import Languages


class RepresentationType(Enum):
    GLOVE = 1
    BOW = 2


BATCH_SIZE = 1000
spacy_models = defaultdict(lambda: None)


def get_glove_representation(sentences, language=Languages.ENGLISH):
    import spacy
    model_name = language.spacy_model_name
    if spacy_models[model_name] is None:
        logging.info(f"Loading spacy model {model_name} from disk")
        spacy_models[model_name] = spacy.load(model_name)

    spacy_model = spacy_models[model_name]
    sentences = remove_stop_words_and_punctuation(sentences, language=language)
    # num_tokens_before = [len(sent.split()) for sent in sentences]
    # logging.info('removing out-of-vocabulary tokens')
    sentences = [' '.join(token for token in sent.split() if spacy_model.vocab.has_vector(token))
                 for sent in sentences]
    # proportion_tokens_after = [len(sent.split())/prev_length for sent, prev_length in zip(sentences, num_tokens_before)
    #                            if prev_length > 0]
    # logging.info(f"number of tokens went down to {'{:.1%}'.format(sum(proportion_tokens_after)/len(sentences))}")

    embeddings = [spacy_model.make_doc(sent).vector for sent in sentences]

    logging.info(f"Done getting GloVe representations for {len(embeddings)} sentences")
    return embeddings


def remove_stop_words_and_punctuation(sentences, language=Languages.ENGLISH):
    # remove punctuation
    punctuation = string.punctuation + '•●'
    sentences = [t.translate(t.maketrans(punctuation, ' ' * len(punctuation))) for t in sentences]
    # remove stop words
    regex = r"\b(" + "|".join(language.stop_words) + r")\b"
    sentences = [re.sub(regex, r"", text) for text in sentences]
    # remove extra spaces
    sentences = [' '.join(sent.split()) for sent in sentences]
    return sentences


def remove_punctuation(sentences):
    punctuation = string.punctuation + '•●'
    sentences = [t.translate(t.maketrans(punctuation, ' ' * len(punctuation))) for t in sentences]
    return sentences
