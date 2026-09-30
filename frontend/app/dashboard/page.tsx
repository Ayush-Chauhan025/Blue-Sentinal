import NavBar from "@/components/DashboardNavbar";
import { prisma } from "@/lib/prisma";
import { generateFHIR } from "@/app/actions/admin";

export default async function DashBoard() {
  const pendingNodes = await prisma.node.findMany({
    where: { status: "PENDING_ADMIN_REVIEW" },
    include: { verifications: { include: { user: true } } },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <NavBar />
      
      <main className="flex-1 overflow-y-auto pt-20 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Command Center</h1>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-sm">
              {pendingNodes.length} Pending Reviews
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Citizen Reporter</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Location</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Field Data</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">AI Analysis</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingNodes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 font-medium">
                      All clear. No pending hazard reports.
                    </td>
                  </tr>
                )}
                
                {pendingNodes.map((node) => {
                  const report = node.verifications[0];
                  if (!report) return null;

                  return (
                    <tr key={node.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{report.user.email}</div>
                        <div className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-700">{node.lat.toFixed(5)}</div>
                        <div className="text-sm font-medium text-gray-700">{node.lng.toFixed(5)}</div>
                      </td>
                      <td className="p-4 flex flex-col gap-1">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold w-fit">
                          💧 {report.waterStatus}
                        </span>
                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold w-fit">
                          🦟 {report.mosquitoPresence}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <div className="size-2 rounded-full bg-green-500"></div>
                           <span className="text-sm font-bold text-gray-700">{report.aiStatus}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <form action={async () => {
                          "use server";
                          await generateFHIR(node.id, report.id);
                        }}>
                          <button type="submit" className="bg-gray-900 hover:bg-black text-white font-bold py-2 px-6 rounded-lg transition-all active:scale-95 shadow-md">
                            Verify & Dispatch FHIR
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}