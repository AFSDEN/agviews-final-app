import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Assessment {
  id: string;
  title: string;
  description: string;
  status: string;
  assessment_type: string;
  total_questions: number;
  created_at: string;
  published_at: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch user data
        const userResponse = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          localStorage.removeItem('auth_token');
          router.push('/login');
          return;
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch assessments
        const assessmentsResponse = await fetch('/api/assessments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (assessmentsResponse.ok) {
          const data = await assessmentsResponse.json();
          setAssessments(data.assessments || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAssessments(assessments.filter((a) => a.id !== assessmentId));
      }
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Agviews</title>
        <meta name="description" content="Your assessments dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container-center flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Agviews
            </Link>
            <div className="flex items-center gap-6">
              <span className="text-gray-700">Welcome, {user?.first_name || user?.email}</span>
              <button
                onClick={handleLogout}
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
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Assessments</h1>
              <p className="text-gray-600 mt-2">Manage your assessments and view responses</p>
            </div>
            <Link href="/assessment" className="btn btn-primary bg-blue-600 text-white px-6 py-3">
              + New Assessment
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="card">
              <div className="text-3xl font-bold text-blue-600">{assessments.length}</div>
              <div className="text-gray-600 text-sm">Total Assessments</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-green-600">
                {assessments.filter((a) => a.status === 'active').length}
              </div>
              <div className="text-gray-600 text-sm">Active Assessments</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-yellow-600">
                {assessments.filter((a) => a.status === 'draft').length}
              </div>
              <div className="text-gray-600 text-sm">Drafts</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-purple-600">
                {assessments.filter((a) => a.status === 'completed').length}
              </div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
          </div>

          {/* Assessments List */}
          {assessments.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2">No assessments yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first assessment to get started
              </p>
              <Link href="/assessment" className="btn btn-primary bg-blue-600 text-white">
                Create Assessment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="card flex justify-between items-center hover:shadow-lg transition">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{assessment.title}</h3>
                    <p className="text-gray-600 text-sm">{assessment.description}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="badge badge-info">
                        {assessment.assessment_type}
                      </span>
                      <span className={`badge ${
                        assessment.status === 'active'
                          ? 'badge-success'
                          : assessment.status === 'draft'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}>
                        {assessment.status}
                      </span>
                      <span className="text-gray-500">
                        {assessment.total_questions} questions
                      </span>
                      <span className="text-gray-500">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/assessment/${assessment.id}`}
                      className="btn btn-secondary"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/assessment-results/${assessment.id}`}
                      className="btn btn-secondary"
                    >
                      Results
                    </Link>
                    <button
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
