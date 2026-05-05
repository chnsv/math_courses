import random
import re
from typing import Dict, Any, Tuple


def generate_variant(template: str, parameters: Dict[str, Any]) -> Tuple[str, Dict[str, Any], float]:
    generated_params = {}

    for param_name, param_range in parameters.items():
        min_val = param_range.get('min', 0)
        max_val = param_range.get('max', 10)
        param_type = param_range.get('type', 'integer')

        if param_type == 'integer':
            generated_params[param_name] = random.randint(min_val, max_val)
        else:
            generated_params[param_name] = round(random.uniform(min_val, max_val), 2)

    question_text = template
    for param_name, param_value in generated_params.items():
        question_text = question_text.replace(f'{{{param_name}}}', str(param_value))

    a = generated_params.get('a', 1)
    b = generated_params.get('b', 0)
    c = generated_params.get('c', 0)
    correct_answer = (c - b) / a

    return question_text, generated_params, correct_answer