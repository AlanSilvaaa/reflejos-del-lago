import PuertoVaras from '@/data/boundaries/PuertoVaras.json'
import Llanquihue from '@/data/boundaries/Llanquihue.json'
import Frutillar from '@/data/boundaries/Frutillar.json'
import LosMuermos from '@/data/boundaries/LosMuermos.json'
import Maullin from '@/data/boundaries/Maullin.json'
import PuertoMontt from '@/data/boundaries/PuertoMontt.json'
import Calbuco from '@/data/boundaries/Calbuco.json'
import Cochamo from '@/data/boundaries/Cochamo.json'
import Fresia from '@/data/boundaries/Fresia.json'

export interface MunicipalityMapEntry {
  name: string
  color: string
  rings: Array<Array<{ lat: number; lng: number }>>
}

export const LLANQUIHUE_CENTER = { lat: -41.471798, lng: -72.9395915 }

export const LLANQUIHUE_MUNICIPALITIES: MunicipalityMapEntry[] = [
  { name: 'Calbuco', color: '#f97316', rings: Calbuco },
  { name: 'Cochamó', color: '#044e69', rings: Cochamo },
  { name: 'Fresia', color: '#ff00f7', rings: Fresia },
  { name: 'Frutillar', color: '#e38010', rings: Frutillar },
  { name: 'Llanquihue', color: '#0389AB', rings: Llanquihue },
  { name: 'Los Muermos', color: '#0000FF', rings: LosMuermos },
  { name: 'Maullín', color: '#9258bf', rings: Maullin },
  { name: 'Puerto Montt', color: '#9e3980', rings: PuertoMontt },
  { name: 'Puerto Varas', color: '#FF0000', rings: PuertoVaras },
]

export const MUNICIPALITY_OPTIONS = LLANQUIHUE_MUNICIPALITIES.map(({ name }) => ({
  label: name,
  value: name,
}))
