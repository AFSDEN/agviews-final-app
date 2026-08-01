import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'rating_scale';
  options: string[];
  correctAnswer: string;
  points: number;
}

export default function Assessment() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState('general');
  const [timeLimit, setTimeLimit] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2', 'Option 3'],
      correctAnswer: 'Option 1',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Assessment title is required');
      return;
    }

    if (questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          assessmentType,
          timeLimit: timeLimit ? parseInt(timeLimit) : null,
          passingScore: parseInt(passingScore),
          questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create assessment');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Assessment - Agviews</title>
        <meta name="description" content="Create a new assessment" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container-center flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Agviews
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container-center py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Assessment</h1>
            <p className="text-gray-600 mb-8">Build a new assessment step by step</p>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Assessment Details Card */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">Assessment Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input"
                      placeholder="Enter assessment title"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input"
                      placeholder="Enter assessment description"
                      rows={4}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assessment Type
                      </label>
                      <select
                        value={assessmentType}
                        onChange={(e) => setAssessmentType(e.target.value)}
                        className="input"
                        disabled={loading}
                      >
                        <option value="general">General</option>
                        <option value="skills">Skills</option>
                        <option value="culture_fit">Culture Fit</option>
                        <option value="leadership">Leadership</option>
                        <option value="technical">Technical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        className="input"
                        placeholder="Leave empty for no limit"
                        min="1"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                      className="input"
                      min="0"
                      max="100"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Questions Card */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">Questions ({questions.length})</h2>

                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>No questions added yet. Add your first question below.</p>
                  </div>
                ) : (
                  <div className="space-y-6 mb-6">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-gray-900">Question {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-4">
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) =>
                              updateQuestion(question.id, { text: e.target.value })
                            }
                            className="input"
                            placeholder="Question text"
                            disabled={loading}
                          />

                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(question.id, {
                                type: e.target.value as Question['type'],
                              })
                            }
                            className="input"
                            disabled={loading}
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="short_answer">Short Answer</option>
                            <option value="rating_scale">Rating Scale</option>
                          </select>

                          <div>
                            <label className="text-sm font-medium text-gray-700">Points</label>
                            <input
                              type="number"
                              value={question.points}
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  points: parseInt(e.target.value),
                                })
                              }
                              className="input"
                              min="1"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn btn-secondary w-full"
                  disabled={loading}
                >
                  + Add Question
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary bg-blue-600 text-white px-8 py-3 flex-1"
                >
                  {loading ? 'Creating...' : 'Create Assessment'}
                </button>
                <Link
                  href="/dashboard"
                  className="btn btn-secondary px-8 py-3 text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
