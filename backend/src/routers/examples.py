from fastapi import APIRouter

from src.models import ExampleSituation, ExamplesResponse

router = APIRouter()

_EXAMPLES: list[ExampleSituation] = [
    ExampleSituation(
        id=1,
        text="Um polícia pediu-me dinheiro de refresco e ameaçou-me de prisão.",
        category="polícia",
    ),
    ExampleSituation(
        id=2,
        text=(
            "Fui preso por me juntar a uma manifestação pacífica contra os raptos"
            " e fiquei uma noite na cadeia sem direito a advogado."
        ),
        category="detenção",
    ),
    ExampleSituation(
        id=3,
        text="O dono do imóvel quer expulsar-me de casa sem aviso nem razão.",
        category="habitação",
    ),
    ExampleSituation(
        id=4,
        text="Fui despedido do meu emprego sem qualquer explicação ou compensação.",
        category="trabalho",
    ),
    ExampleSituation(
        id=5,
        text="A polícia entrou na minha casa de noite sem mandado judicial.",
        category="domicílio",
    ),
    ExampleSituation(
        id=6,
        text="Fui torturado numa esquadra de polícia para me forçarem a assinar uma confissão.",
        category="tortura",
    ),
]


@router.get("/examples", response_model=ExamplesResponse)
async def get_examples() -> ExamplesResponse:
    return ExamplesResponse(examples=_EXAMPLES)
