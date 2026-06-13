import random
import re
from typing import Dict, Any, Tuple, List, Optional
import sqlite3
from sympy import symbols, solve, sympify


class VariantGenerator:
    def __init__(self, db_path: str = 'math_courses.db'):
        self.db_path = db_path

    def get_templates_by_subtopic(self, theory_block_id: int) -> List[Dict]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, title, template_text, answer_template, difficulty
            FROM question_templates
            WHERE theory_block_id = ?
        """, (theory_block_id,))

        templates = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return templates

    def generate_numeric_value(self, param_range: Dict) -> float:
        min_val = param_range.get('min', 1)
        max_val = param_range.get('max', 20)
        param_type = param_range.get('type', 'integer')

        if param_type == 'integer':
            return random.randint(min_val, max_val)
        elif param_type == 'float':
            return round(random.uniform(min_val, max_val), 2)
        elif param_type == 'positive':
            return random.randint(max(1, min_val), max_val)
        else:
            return random.randint(min_val, max_val)

    def extract_parameters(self, template_text: str) -> List[str]:
        pattern = r'\{([a-zA-Z_][a-zA-Z0-9_]*)\}'
        return re.findall(pattern, template_text)

    def generate_question(self, template: Dict) -> Tuple[str, str, Dict]:
        template_text = template['template_text']
        answer_template = template['answer_template']

        params = self.extract_parameters(template_text)

        param_values = {}
        for param in params:
            param_ranges = {
                'a': {'min': 1, 'max': 20, 'type': 'integer'},
                'b': {'min': 1, 'max': 20, 'type': 'integer'},
                'c': {'min': 1, 'max': 20, 'type': 'integer'},
                'd': {'min': 1, 'max': 20, 'type': 'integer'},
            }
            param_range = param_ranges.get(param, {'min': 1, 'max': 20, 'type': 'integer'})
            param_values[param] = self.generate_numeric_value(param_range)

        question = template_text
        for name, value in param_values.items():
            question = question.replace(f'{{{name}}}', str(value))

        answer = answer_template
        for name, value in param_values.items():
            answer = answer.replace(f'{{{name}}}', str(value))

        try:
            if any(op in answer for op in ['+', '-', '*', '/', '//']):
                if '//' in answer:
                    result = eval(answer)
                else:
                    result = eval(answer)
                answer = str(result)
        except:
            pass

        return question, answer, param_values

    def generate_variant(self, theory_block_id: int, difficulty_filter: Optional[int] = None) -> Dict:
        templates = self.get_templates_by_subtopic(theory_block_id)

        if not templates:
            return None

        if difficulty_filter:
            templates = [t for t in templates if t['difficulty'] <= difficulty_filter]

        if not templates:
            templates = self.get_templates_by_subtopic(theory_block_id)

        selected = random.choice(templates)
        question, answer, params = self.generate_question(selected)

        return {
            'template_id': selected['id'],
            'title': selected['title'],
            'question': question,
            'answer': answer,
            'difficulty': selected['difficulty'],
            'parameters_used': params
        }

    def generate_test_variant(self, theory_block_ids: List[int], num_questions: int = 10) -> List[Dict]:
        all_templates = []
        for theory_block_id in theory_block_ids:
            templates = self.get_templates_by_subtopic(theory_block_id)
            all_templates.extend(templates)

        if not all_templates:
            return []

        selected_templates = random.sample(all_templates, min(num_questions, len(all_templates)))

        variant = []
        for template in selected_templates:
            question, answer, params = self.generate_question(template)
            variant.append({
                'question': question,
                'answer': answer,
                'difficulty': template['difficulty'],
                'title': template['title']
            })

        return variant


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

    if 'x' in question_text.lower():
        try:
            x = symbols('x')
            if '=' in question_text:
                left, right = question_text.split('=')
                expr = sympify(left) - sympify(right)
                solutions = solve(expr, x)
                if solutions:
                    correct_answer = float(solutions[0])
                else:
                    correct_answer = 0
            else:
                correct_answer = 0
        except:
            correct_answer = 0
    else:
        try:
            correct_answer = eval(question_text)
        except:
            correct_answer = 0

    return question_text, generated_params, correct_answer