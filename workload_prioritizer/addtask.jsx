// Add Task form

const { useState: useStateAT, useMemo: useMemoAT, useEffect: useEffectAT } = React;

function StarRow({ value, onChange, max = 5 }) {
  return (
    <div className="star-row">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`star ${i < value ? 'on' : ''}`}
          onClick={() => onChange(i + 1)}
          aria-label={`${i + 1}`}
        >
          <span className="star-dot" />
        </button>
      ))}
    </div>
  );
}

function AddTaskForm({ subjects, dayLabels, dates, capacity, onAdd, onCancel, t, onAddSubject }) {
  const [title, setTitle] = useStateAT('');
  const [subjectId, setSubjectId] = useStateAT(subjects[0].id);
  const [deadline, setDeadline] = useStateAT(4); // single day selection
  const [customDeadline, setCustomDeadline] = useStateAT(''); // for dates outside current week
  const [difficulty, setDifficulty] = useStateAT(3);
  const [importance, setImportance] = useStateAT(3);
  const [comfortable, setComfortable] = useStateAT(true);
  const [hours, setHours] = useStateAT(2);
  const [hoursTouched, setHoursTouched] = useStateAT(false);
  const [showAddSubject, setShowAddSubject] = useStateAT(false);
  const [newSubjectName, setNewSubjectName] = useStateAT('');
  const [newSubjectColor, setNewSubjectColor] = useStateAT('#a78bfa');

  const autoHours = useMemoAT(
    () => estimateHours({ difficulty, importance, comfortable }),
    [difficulty, importance, comfortable]
  );

  useEffectAT(() => {
    if (!hoursTouched) setHours(autoHours);
  }, [autoHours, hoursTouched]);

  const subj = subjects.find((s) => s.id === subjectId);
  const splitDays = daysToSplit(hours);
  const slots = splitHours(hours, splitDays);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const newSubj = {
      id: 'custom-' + Date.now(),
      name: newSubjectName.trim(),
      short: newSubjectName.trim().substring(0, 3).toUpperCase(),
      color: newSubjectColor,
    };
    onAddSubject(newSubj);
    setSubjectId(newSubj.id);
    setShowAddSubject(false);
    setNewSubjectName('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      subjectId, 
      deadline,
      customDeadline, // pass custom deadline date
      difficulty, 
      importance, 
      comfortable, 
      hours,
    });
    // reset
    setTitle('');
    setDeadline(4);
    setCustomDeadline('');
    setHoursTouched(false);
  };

  return (
    <form className="addtask" onSubmit={submit}>
      <div className="at-head">
        <div className="at-title">{t.addNewTask}</div>
        <button type="button" className="at-x" onClick={onCancel} aria-label="close">✕</button>
      </div>

      <div className="at-field">
        <label>{t.title}</label>
        <input
          className="at-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AWS Lambda assignment"
          autoFocus
        />
      </div>

      <div className="at-field">
        <label>{t.subject}</label>
        <div className="subject-grid">
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`subj-chip ${subjectId === s.id ? 'on' : ''}`}
              onClick={() => setSubjectId(s.id)}
            >
              <span className="subj-dot" style={{ background: s.color }} />
              <span className="subj-name">{s.name}</span>
            </button>
          ))}
          <button
            type="button"
            className="subj-chip add-subj-btn"
            onClick={() => setShowAddSubject(!showAddSubject)}
          >
            <span className="subj-plus">+</span>
            <span className="subj-name">{t.addSubject || 'Add Subject'}</span>
          </button>
        </div>
        {showAddSubject && (
          <div className="add-subject-form">
            <input
              className="at-input"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder={t.subjectName || "Subject name"}
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={newSubjectColor}
                onChange={(e) => setNewSubjectColor(e.target.value)}
                style={{ width: '50px', height: '36px', border: '2px solid var(--line)', borderRadius: '8px', cursor: 'pointer' }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddSubject}
                style={{ flex: 1, padding: '8px 16px' }}
              >
                {t.addSubject || 'Add Subject'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="at-field">
        <label>{t.deadline}</label>
        <div className="deadline-row">
          {dayLabels.map((d, i) => (
            <button
              key={i}
              type="button"
              className={`deadline-chip ${deadline === i && !customDeadline ? 'on' : ''}`}
              onClick={() => { setDeadline(i); setCustomDeadline(''); }}
            >
              <span className="dl-day">{d}</span>
              <span className="dl-date mono">{dates[i].getDate()}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: '12px' }}>
          <label style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '6px', display: 'block' }}>
            {t.orCustomDate || 'Or select a custom date'}
          </label>
          <input
            type="date"
            className="at-input"
            value={customDeadline}
            onChange={(e) => { setCustomDeadline(e.target.value); }}
            style={{ fontSize: '13px' }}
          />
        </div>
      </div>

      <div className="at-row-2">
        <div className="at-field">
          <label>{t.difficulty}</label>
          <StarRow value={difficulty} onChange={setDifficulty} />
        </div>
        <div className="at-field">
          <label>{t.importance}</label>
          <StarRow value={importance} onChange={setImportance} />
        </div>
      </div>

      <div className="at-field">
        <label>{t.comfortable}</label>
        <div className="seg-2">
          <button type="button" className={comfortable ? 'on' : ''}
                  onClick={() => setComfortable(true)}>{t.yes}</button>
          <button type="button" className={!comfortable ? 'on' : ''}
                  onClick={() => setComfortable(false)}>{t.no}</button>
        </div>
      </div>

      <div className="at-field at-est">
        <div className="at-est-head">
          <label>{t.estimated}</label>
          {!hoursTouched && <span className="at-est-tag mono">{t.autoCalc}</span>}
        </div>
        <div className="at-est-body">
          <input
            type="range" min="0.5" max="12" step="0.5"
            value={hours}
            onChange={(e) => { setHours(Number(e.target.value)); setHoursTouched(true); }}
          />
          <div className="at-est-val mono">{hours}<span className="at-est-unit">{t.hours}</span></div>
        </div>
        <div className="at-est-split">
          <span className="dot" style={{ background: subj?.color }} />
          {t.splitAcross} <span className="mono">{splitDays}</span> {t.days}:
          <span className="splits mono">
            {slots.map((s, i) => <span key={i}>{s}{t.hours}</span>)}
          </span>
        </div>
      </div>

      <div className="at-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>{t.cancel}</button>
        <button type="submit" className="btn-primary"
                disabled={!title.trim()}>
          {t.save}
        </button>
      </div>
    </form>
  );
}

window.AddTaskForm = AddTaskForm;
