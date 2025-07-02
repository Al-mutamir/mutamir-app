import { useEffect, useState } from "react"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getAgencyStats } from "@/lib/firebase/firestore"
import { useAuth } from "@/context/auth-context"

const PackagesPage = () => {
  const { user } = useAuth()
  const [totalPackages, setTotalPackages] = useState(0)

  useEffect(() => {
    const fetchPackages = async () => {
      if (!user?.uid) return
      const agencyStats = await getAgencyStats(user.uid)
      setTotalPackages((agencyStats.packages || []).length)
    }
    fetchPackages()
  }, [user?.uid])

  return (
    <ProtectedRoute allowedRoles={["agency", "admin"]}>
      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalPackages}</span>
          </CardContent>
        </Card>
        {/* Add your packages content here */}
      </div>
    </ProtectedRoute>
  )
}

export default PackagesPage
