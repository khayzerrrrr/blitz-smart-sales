import { useMemo, useState } from "react"
import type { School } from "@/types"
import { mockSchools } from "@/data/mockData"

export function useSchools() {
  const [search, setSearch] = useState("")
  const [regionalFilter, setRegionalFilter] = useState("")

  const filtered = useMemo(() => {
    let result: School[] = mockSchools
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.regional.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q)
      )
    }
    if (regionalFilter) {
      result = result.filter((s) => s.regional === regionalFilter)
    }
    return result
  }, [search, regionalFilter])

  const regionals = useMemo(
    () => [...new Set(mockSchools.map((s) => s.regional))],
    []
  )

  return {
    schools: filtered,
    allSchools: mockSchools,
    search,
    setSearch,
    regionalFilter,
    setRegionalFilter,
    regionals,
  }
}
