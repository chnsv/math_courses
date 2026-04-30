import random
import re
from typing import Dict, Any, Tuple


def generate_variant(template: str, parameters: Dict[str, Any]) -> Tuple[str, Dict[str, Any], str]:
    """
    Генерация уникального варианта задачи на основе шаблона.

    Параметры:
    - template: строка с плейсхолдерами вида {a}, {b}, {c}
    - parameters: словарь с диапазонами значений

    Пример:
    template = "{a}·x + {b} = {c}"
    parameters = {
        "a": {"min": 1, "max": 10, "type": "integer"},
        "b": {"min": -20, "max": 20, "type": "integer"},
        "c": {"min": -20, "max": 20, "type": "integer"}
    }
    """
    generated_params = {}

    # Генерация случайных значений
    for param_name, param_range in parameters.items():
        param_type = param_range.get('type', 'integer')
        min_val = param_range.get('min', 0)
        max_val = param_range.get('max', 10)

        if param_type == 'integer':
            generated_params[param_name] = random.randint(min_val, max_val)
        elif param_type == 'float':
            generated_params[param_name] = round(random.uniform(min_val, max_val), 2)
        else:
            generated_params[param_name] = param_range.get('default', 0)

    # Подстановка параметров в шаблон
    question_text = template
    for param_name, param_value in generated_params.items():
        question_text = question_text.replace(f'{{{param_name}}}', str(param_value))

    # Вычисление правильного ответа для линейного уравнения a*x + b = c
    if 'a' in generated_params and 'b' in generated_params and 'c' in generated_params:
        try:
            a = generated_params['a']
            b = generated_params['b']
            c = generated_params['c']
            correct_answer = (c - b) / a
        except ZeroDivisionError:
            correct_answer = None
    else:
        correct_answer = None

    return question_text, generated_params, str(correct_answer) if correct_answer is not None else ""