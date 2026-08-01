import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Response {
  id: string;
  respondentName: string;
  respondentEmail: string;
  score: number;
  percentage: number;
  status: string;
  completedAt: string;
  timeTakenSeconds: number;
}

export default function AssessmentResults() {
  const router = useRouter();
  const { id } = router.query;
  const [responses, setResponses] = useState<Response[]>([]);
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/assessments/${id}/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAssessment(data.assessment);
          setResponses(data.responses || []);
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const completedResponses = responses.filter((r) => r.status === 'completed');
  const avgScore = completedResponses.length
    ? Math.round(
        completedResponses.reduce((sum, r) => sum + r.score, 0) / completedResponses.length
      )
    : 0;

  return (
    <>
      <Head>
        <title>Assessment Results - Agviews</title>
        <meta name="description" content="View assessment results and analytics" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container-center flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Agviews
            </Link>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  router.push('/login');
                }}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container-center py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            {assessment && (
              <>
                <h1 className="text-4xl font-bold text-gray-900">{assessment.title}</h1>
                <p className="text-gray-600 mt-2">{assessment.description}</p>
              </>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="card">
              <div className="text-3xl font-bold text-blue-600">{responses.length}</div>
              <div className="text-gray-600 text-sm">Total Responses</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-green-600">{completedResponses.length}</div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-yellow-600">
                {responses.filter((r) => r.status === 'in_progress').length}
              </div>
              <div className="text-gray-600 text-sm">In Progress</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-purple-600">{avgScore}%</div>
              <div className="text-gray-600 text-sm">Average Score</div>
            </div>
          </div>

          {/* Responses Table */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Responses</h2>

            {responses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600">No responses yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-bold">Respondent</th>
                      <th className="text-left py-3 px-4 font-bold">Email</th>
                      <th className="text-left py-3 px-4 font-bold">Status</th>
                      <th className="text-left py-3 px-4 font-bold">Score</th>
                      <th className="text-left py-3 px-4 font-bold">Time (min)</th>
                      <th className="text-left py-3 px-4 font-bold">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response) => (
                      <tr key={response.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{response.respondentName || 'Anonymous'}</td>
                        <td className="py-3 px-4">{response.respondentEmail}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              response.status === 'completed'
                                ? 'badge-success'
                                : response.status === 'in_progress'
                                ? 'badge-warning'
                                : 'badge-info'
                            }`}
                          >
                            {response.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {response.status === 'completed' ? (
                            <span className="font-bold">
                              {response.score}/{assessment?.total_questions} ({response.percentage}%)
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {response.timeTakenSeconds
                            ? Math.round(response.timeTakenSeconds / 60)
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {response.completedAt
                            ? new Date(response.completedAt).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                // Export to CSV
                const csv = [
                  ['Respondent', 'Email', 'Status', 'Score', 'Percentage', 'Time (min)', 'Completed'],
                  ...responses.map((r) => [
                    r.respondentName || 'Anonymous',
                    r.respondentEmail,
                    r.status,
                    r.score || '',
                    r.percentage || '',
                    r.timeTakenSeconds ? Math.round(r.timeTakenSeconds / 60) : '',
                    r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '',
                  ]),
                ]
                  .map((row) => row.join(','))
                  .join('\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${assessment?.title}-results.csv`;
                a.click();
              }}
              className="btn btn-primary bg-blue-600 text-white"
            >
              Export to CSV
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
