async function test() {
  // Sign up
  const email = 'test' + Date.now() + '@example.com';
  const signupResp = await fetch('https://skulix.vercel.app/api/auth/student/independent-signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student',
      email: email,
      grade: 5,
      password: 'password123'
    })
  });
  if (!signupResp.ok) {
    console.error('Signup failed:', await signupResp.text());
    return;
  }
  const signupData = await signupResp.json();
  const token = signupData.token;
  if (!token) {
    console.error('No token in response:', signupData);
    return;
  }
  console.log('Signed up');

  // Generate test
  const genResp = await fetch('https://skulix.vercel.app/api/mwalimu/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      subject: 'Mathematics',
      topic: 'Addition',
      questionCount: 3,
      difficulty: 'easy'
    })
  });
  if (!genResp.ok) {
    console.error('Gen failed:', await genResp.text());
    return;
  }
  const testData = await genResp.json();
  console.log('Generated test:', testData.title);

  // Submit all wrong answers
  const studentAnswers = {};
  testData.questions.forEach((q, idx) => {
    studentAnswers[`q-${idx}`] = 'wrong';
  });
  const submitResp = await fetch('https://skulix.vercel.app/api/mwalimu/test', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      questions: testData.questions,
      studentAnswers: studentAnswers,
      subject: testData.subject,
      grade: testData.grade
    })
  });
  if (!submitResp.ok) {
    console.error('Submit failed:', await submitResp.text());
    return;
  }
  const resultData = await submitResp.json();
  console.log('Submitted, score:', resultData.score, '/', resultData.totalMarks);

  // Check revision papers
  const papersResp = await fetch('https://skulix.vercel.app/api/revision-papers', {
    headers: { Authorization: 'Bearer ' + token }
  });
  if (!papersResp.ok) {
    console.error('Papers failed:', await papersResp.text());
    return;
  }
  const papersData = await papersResp.json();
  console.log('Revision papers count:', papersData.papers.length);
  if (papersData.papers.length > 0) {
    const latest = papersData.papers[0];
    console.log('Latest paper ID:', latest.id);
    // View it
    const viewResp = await fetch('https://skulix.vercel.app/api/revision-papers/' + latest.id, {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (viewResp.ok) {
      const paper = await viewResp.json();
      console.log('Paper content type:', typeof paper.paper.content);
      console.log('Paper content (first 200 chars):', String(paper.paper.content).substring(0,200));
      try {
        const content = JSON.parse(paper.paper.content);
        console.log('Parsed content keys:', Object.keys(content));
        console.log('Paper content questions:', content.questions?.length);
      } catch (e) {
        console.error('Content parse error:', e, 'content:', paper.paper.content);
      }
    } else {
      console.error('View failed:', await viewResp.text());
    }
  }

  console.log('SUCCESS: Flow completed');
}

test().catch(err => {
  console.error('ERROR:', err);
});
