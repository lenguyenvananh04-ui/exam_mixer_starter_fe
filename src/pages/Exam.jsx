import { useState } from "react";
import { startExam, submitExam } from "../api";

export default function Exam({ user }) {
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const beginExam = async () => {
    const data = await startExam(user.code);
    setQuestions(data.questions);
    setSessionId(data.session_id);
  };

  const handleAnswer = (qid, ans) => {
    setAnswers({ ...answers, [qid]: ans });
  };

  const submit = async () => {
    const res = await submitExam(sessionId, answers);
    setResult(res);
  };

  if (result) return <h3>✅ Điểm: {result.score}/{result.total_points}</h3>;

  return (
    <div>
      <h2>Làm bài thi</h2>
      {!sessionId ? (
        <button onClick={beginExam}>Bắt đầu thi</button>
      ) : (
        <div>
          {questions.map((q, idx) => (
            <div key={q.id}>
              <p>{idx + 1}. {q.text}</p>
              {q.options.map((opt, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={q.id}
                    value={String.fromCharCode(65 + i)}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                  />
                  {String.fromCharCode(65 + i)}. {opt}
                </label>
              ))}
            </div>
          ))}
          <button onClick={submit}>Nộp bài</button>
        </div>
      )}
    </div>
  );
}
