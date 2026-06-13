from sympy import symbols, Eq, solve, sympify, SympifyError, simplify
import re
from typing import Tuple, Optional, List, Set


def parse_equation(equation_str: str):
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


def parse_user_roots(answer_str: str) -> Set[float]:
    answer_str = answer_str.strip().lower()
    roots = set()

    if "нет" in answer_str or "решений" in answer_str:
        return set()

    try:
        num = float(answer_str)
        roots.add(round(num, 10))
        return roots
    except ValueError:
        pass

    patterns = [
        r'x\s*=\s*([+-]?\d*\.?\d*(?:/\d+)?)',  # x=3, x=3/2
        r'x_?\d*\s*=\s*([+-]?\d*\.?\d*(?:/\d+)?)',  # x1=3
        r'([+-]?\d*\.?\d*(?:/\d+)?)\s*,\s*([+-]?\d*\.?\d*(?:/\d+)?)',  # 3, 5
    ]

    for pattern in patterns:
        matches = re.findall(pattern, answer_str)
        for match in matches:
            if isinstance(match, tuple):
                for m in match:
                    try:
                        # Поддержка дробей
                        if '/' in m:
                            num, den = m.split('/')
                            roots.add(round(float(num) / float(den), 10))
                        else:
                            roots.add(round(float(m), 10))
                    except ValueError:
                        pass
            else:
                try:
                    if '/' in match:
                        num, den = match.split('/')
                        roots.add(round(float(num) / float(den), 10))
                    else:
                        roots.add(round(float(match), 10))
                except ValueError:
                    pass

    return roots


def get_equation_roots(equation_eq) -> Set[float]:
    try:
        solutions = solve(equation_eq, symbols('x'))
        roots = set()
        for sol in solutions:
            if sol.is_real:
                roots.add(round(float(sol), 10))
        return roots
    except Exception:
        return set()


def check_equation(equation_str: str, user_answer_str: str) -> Tuple[bool, str, Optional[List[str]]]:
    """
    Проверяет эквивалентность ответа пользователя и правильного решения
    Поддерживает форматы:
    - x=3
    - x=3, x=5
    - x1=2, x2=3
    - 3 (просто число)
    - нет решений
    """
    try:
        equation, left_expr, right_expr = parse_equation(equation_str)
        correct_roots = get_equation_roots(equation)
        user_roots = parse_user_roots(user_answer_str)

        if not correct_roots:
            if not user_roots:
                return True, "Верно! Уравнение не имеет действительных корней.", ["нет решений"]
            else:
                return False, f"Уравнение не имеет действительных корней, а вы ввели {user_roots}", ["нет решений"]

        if not user_roots:
            return False, f"Уравнение имеет корни: {correct_roots}", [str(r) for r in correct_roots]

        if user_roots == correct_roots:
            return True, f"Верно! Все корни найдены правильно: {correct_roots}", [str(r) for r in correct_roots]
        elif user_roots.issubset(correct_roots):
            missing = correct_roots - user_roots
            return False, f"Найдены не все корни. Пропущены: {missing}", [str(r) for r in correct_roots]
        elif correct_roots.issubset(user_roots):
            extra = user_roots - correct_roots
            return False, f"Найдены лишние корни: {extra}", [str(r) for r in correct_roots]
        else:
            return False, f"Корни не совпадают. Ожидалось: {correct_roots}, получено: {user_roots}", [str(r) for r in
                                                                                                      correct_roots]

    except (ValueError, SympifyError) as e:
        return False, f"Ошибка при проверке: {str(e)}", None
    except Exception as e:
        return False, f"Неожиданная ошибка: {str(e)}", None


def check_answer_equivalence(user_answer: str, correct_answer: str) -> Tuple[bool, str]:
    x = symbols('x')

    try:
        user_parsed = sympify(user_answer.replace('=', '-'))
        correct_parsed = sympify(correct_answer.replace('=', '-'))

        diff = simplify(user_parsed - correct_parsed)
        if diff == 0:
            return True, "Ответы эквивалентны"
        else:
            return False, "Ответы не совпадают"
    except:
        user_norm = re.sub(r'\s+', '', user_answer.lower())
        correct_norm = re.sub(r'\s+', '', correct_answer.lower())
        return user_norm == correct_norm, "Совпадает" if user_norm == correct_norm else "Не совпадает"