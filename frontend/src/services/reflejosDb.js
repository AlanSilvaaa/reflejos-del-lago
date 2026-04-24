import initSqlJs from 'sql.js'

let nodesPromise

async function loadDatabase() {
  const SQL = await initSqlJs({
    locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm`,
  })

  const response = await fetch(`${import.meta.env.BASE_URL}reflejos.sqlite3`)

  if (!response.ok) {
    throw new Error(`No se pudo cargar reflejos.sqlite3: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()
  return new SQL.Database(new Uint8Array(buffer))
}

async function loadNodes() {
  const db = await loadDatabase()
  const result = db.exec(`
    SELECT city.name, geogessr_node.latitude, geogessr_node.longitude
    FROM geogessr_node
    INNER JOIN city ON city.id = geogessr_node.city_id
  `)

  if (!result.length) {
    return []
  }

  return result[0].values.map(([city, lat, lng]) => ({
    city,
    lat,
    lng,
  }))
}

export async function getAllNodes() {
  if (!nodesPromise) {
    nodesPromise = loadNodes()
  }

  return nodesPromise
}

export async function getRandomNode(usedCoords = []) {
  const allNodes = await getAllNodes()
  const usedSet = new Set(usedCoords.map(({ lat, lng }) => `${lat},${lng}`))
  const availableNodes = allNodes.filter(({ lat, lng }) => !usedSet.has(`${lat},${lng}`))
  const source = availableNodes.length ? availableNodes : allNodes

  if (!source.length) {
    throw new Error('No hay nodos disponibles en la base de datos local')
  }

  return source[Math.floor(Math.random() * source.length)]
}
