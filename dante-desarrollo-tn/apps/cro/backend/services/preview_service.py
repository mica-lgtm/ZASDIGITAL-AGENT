from jinja2 import Environment, Undefined


def render(html: str, variables: dict) -> str:
    env = Environment(undefined=Undefined)
    return env.from_string(html).render(**variables)
