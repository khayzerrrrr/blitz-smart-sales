import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAllSchools, fetchMySchools, type SchoolRecord } from "@/services/school.service"

export function useSchools(mySchoolsOnly = false) {
  const [search, setSearch] = useState("")
  const [regionalFilter, setRegionalFilter] = useState("")

  const { data: allSchools = [], isLoading, error } = useQuery({
    queryKey: ["schools", mySchoolsOnly ? "mine" : "all"],
    queryFn: mySchoolsOnly ? fetchMySchools : fetchAllSchools,
  })

  const filtered = useMemo(() => {
    let result: SchoolRecord[] = allSchools
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.regional.toLowerCase().includes(q) ||
          s.contact_person.toLowerCase().includes(q)
      )
    }
    if (regionalFilter) {
      result = result.filter((s) => s.regional === regionalFilter)
    }
    return result
  }, [allSchools, search, regionalFilter])

  const regionals = useMemo(
    () => [...new Set(allSchools.map((s) => s.regional).filter(Boolean))],
    [allSchools]
  )

  return {
    schools: filtered,
    allSchools,
    isLoading,
    error,
    search,
    setSearch,
    regionalFilter,
    setRegionalFilter,
    regionals,
  }
}
