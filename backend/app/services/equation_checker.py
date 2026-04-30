from sympy import symbols, Eq, solve, sympify, SympifyError
from sympy.parsing.sympy_parser import parse_expr
import re
from typing import Tuple, Optional, List


def parse_equation(equation_str: str):
    """
    Парсинг строки уравнения вида '2*x + 4 = 10'
    Возвращает (уравнение, левая_часть, правая_часть)
    """
    if '=' not in equation_str:
        raise ValueError("Уравнение должно содержать знак '='")

    left, right = equation_str.split('=', 1)
    x = symbols('x')

    try:
        left_expr = sympify(left.strip())
        right_expr = sympify(right.strip())
    except SympifyError as e:
        raise ValueError(f"Не удалось распознать уравнение: {e}")

    return Eq(left_expr, right_expr), left_expr, right_expr


def parse_user_answer(answer_str: str):
    """
    Парсинг ответа пользователя.
    Поддерживает форматы: 'x=3', '3', 'x=2, y=1'
    """
    answer_str = answer_str.strip().lower()

    # Если ответ в формате x=3
    if '=' in answer_str and 'x' in answer_str:
        # Находим часть после знака =
        parts = answer_str.split('=')
        if len(parts) >= 2:
            val_part = parts[1].strip()
            try:
                return sympify(val_part)
            except SympifyError:
                raise ValueError(f"Не удалось распознать значение: {val_part}")

    # Если ответ — просто число
    try:
        return sympify(answer_str)
    except SympifyError:
        raise ValueError("Не удалось распознать ответ")


def check_equation(equation_str: str, user_answer_str: str) -> Tuple[bool, str, Optional[List]]:
    """
    Проверка решения уравнения.
    Возвращает (верно_ли, пояснение, правильное_решение)
    """
    try:
        x = symbols('x')
        equation, left_expr, right_expr = parse_equation(equation_str)

        # Находим правильное решение
        correct_solutions = solve(equation, x)

        # Парсим ответ пользователя
        user_value = parse_user_answer(user_answer_str)

        # Проверяем подстановкой
        left_val = left_expr.subs(x, user_value)
        right_val = right_expr.subs(x, user_value)

        # Используем sympy.simplify для сравнения (учёт погрешностей)
        is_correct = bool(left_val == right_val)

        # Формируем пояснение
        if is_correct:
            explanation = f"✓ Верно! При x = {user_value} левая часть равна {left_val}, правая — {right_val}."
        else:
            if correct_solutions:
                correct_str = ", ".join(str(sol) for sol in correct_solutions)
                explanation = f"✗ Неверно. При x = {user_value} левая часть равна {left_val}, а правая — {right_val}. "
                explanation += f"Правильное решение: x = {correct_str}"
            else:
                explanation = f"✗ Неверно. При x = {user_value} левая часть ({left_val}) не равна правой ({right_val})."

        # Преобразуем sympy-объекты в читаемый вид
        correct_solutions_str = [str(sol) for sol in correct_solutions] if correct_solutions else []

        return is_correct, explanation, correct_solutions_str

    except (ValueError, SympifyError) as e:
        return False, f"Ошибка при проверке: {str(e)}", None
    except Exception as e:
        return False, f"Неожиданная ошибка: {str(e)}", None