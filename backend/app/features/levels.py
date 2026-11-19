"""Exact pedagogical labels; no automatic reclassification of historical records."""
from typing import Literal

LiteracyLevel = Literal['pre-silabico', 'silabico-sem-valor', 'silabico-com-valor', 'silabico-alfabetico', 'alfabetico']
ConfirmedLevel = Literal['pre-silabico', 'silabico', 'silabico-sem-valor', 'silabico-com-valor', 'silabico-alfabetico', 'alfabetico']
LABELS = {'pre-silabico': 'Pré-silábico', 'silabico': 'Silábico (registro anterior, sem detalhamento)',
          'silabico-sem-valor': 'Silábico sem valor sonoro', 'silabico-com-valor': 'Silábico com valor sonoro',
          'silabico-alfabetico': 'Silábico-alfabético', 'alfabetico': 'Alfabético'}
