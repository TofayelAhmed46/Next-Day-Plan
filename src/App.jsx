import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard, CalendarDays, BarChart3, Settings, Plus, Check,
  Circle, Clock3, Target, Flame, ChevronLeft, ChevronRight, Trash2, X,
  ListTodo, TrendingUp, Sparkles, CalendarCheck, ArrowUpRight
} from 'lucide-react';

const STORE = 'nextday-planner-v1';
const todayISO = () => new Date().toLocaleDateString('en-CA');
const shiftDate = (date, amount) => { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate()+amount); return d.toLocaleDateString('en-CA'); };
const pretty = (date, opts={weekday:'long', month:'long', day:'numeric', year:'numeric'}) => new Date(date+'T12:00:00').toLocaleDateString(undefined, opts);
const initial = () => {
  const today = todayISO(), tomorrow = shiftDate(today,1);
  return {
    [tomorrow]: [
      {id: crypto.randomUUID(), title:'Review priorities for the day', category:'Personal', time:'08:00', done:false},
      {id: crypto.randomUUID(), title:'Focus work session', category:'Work', time:'10:00', done:false},
      {id: crypto.randomUUID(), title:'Read or learn something new', category:'Learning', time:'20:00', done:false}
    ],
    [today]: []
  };
};
function readPlans(){ try { const v=JSON.parse(localStorage.getItem(STORE)); return v && typeof v==='object' ? v : initial(); } catch { return initial(); } }
const categories = ['Work','Personal','Learning','Health','Other'];

function App(){
  const [plans,setPlans] = useState(readPlans);
  const [selected,setSelected] = useState(todayISO());
  const [view,setView] = useState('overview');
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({title:'',category:'Work',time:'09:00'});
  const [toast,setToast] = useState('');
  const today=todayISO();
  const save = next => { setPlans(next); localStorage.setItem(STORE,JSON.stringify(next)); };
  const tasks = plans[selected] || [];
  const done = tasks.filter(t=>t.done).length;
  const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
  const totalTasks = Object.values(plans).flat().length;
  const completedTasks = Object.values(plans).flat().filter(t=>t.done).length;
  const allDates = Object.keys(plans).sort();
  const dayStats = date => { const a=plans[date]||[]; return {total:a.length,done:a.filter(x=>x.done).length,pct:a.length?Math.round(a.filter(x=>x.done).length/a.length*100):0}; };
  const weekDates = useMemo(()=>Array.from({length:7},(_,i)=>shiftDate(today,-6+i)),[today]);
  const monthDates = useMemo(()=>{const d=new Date(today+'T12:00:00'); const start=new Date(d.getFullYear(),d.getMonth(),1); const end=new Date(d.getFullYear(),d.getMonth()+1,0); return Array.from({length:end.getDate()},(_,i)=>new Date(start.getFullYear(),start.getMonth(),i+1).toLocaleDateString('en-CA'));},[today]);
  const week = weekDates.map(date=>({date,...dayStats(date)}));
  const month = monthDates.map(date=>({date,...dayStats(date)}));
  const weekTotals=week.reduce((a,x)=>({total:a.total+x.total,done:a.done+x.done}),{total:0,done:0});
  const monthTotals=month.reduce((a,x)=>({total:a.total+x.total,done:a.done+x.done}),{total:0,done:0});
  const showToast = msg => {setToast(msg); setTimeout(()=>setToast(''),2200);};
  const toggle = id => save({...plans,[selected]:tasks.map(t=>t.id===id?{...t,done:!t.done}:t)});
  const remove = id => save({...plans,[selected]:tasks.filter(t=>t.id!==id)});
  const addTask = e => {e.preventDefault(); if(!form.title.trim())return; save({...plans,[selected]:[...tasks,{...form,id:crypto.randomUUID(),done:false}]}); setForm({title:'',category:'Work',time:'09:00'});setShowAdd(false);showToast('Task added to your plan');};
  const goDay = delta => setSelected(d=>shiftDate(d,delta));
  const nav = [{id:'overview',label:'Overview',icon:LayoutDashboard},{id:'weekly',label:'Weekly report',icon:BarChart3},{id:'monthly',label:'Monthly report',icon:CalendarDays}];
  const tomorrow=shiftDate(today,1);
  const planningDate = selected > today ? 'Upcoming plan' : selected===today ? "Today's progress" : 'Past day review';

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>nextday</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(n=><button key={n.id} className={`nav-item ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}><n.icon size={18}/><span>{n.label}</span>{n.id==='overview'&&<span className="nav-dot"/>}</button>)}</nav>
      <div className="side-bottom">
        <div className="tip-card"><div className="tip-icon"><Target size={17}/></div><strong>Small steps add up.</strong><p>A clear plan today makes tomorrow easier.</p></div>
        <div className="profile"><div className="avatar">Y</div><div><b>Your workspace</b><small>Personal planner</small></div><Settings size={17} className="muted-icon"/></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><Sparkles size={17}/></span> nextday</div><div className="breadcrumb">Workspace <span>/</span> {nav.find(n=>n.id===view)?.label}</div><div className="top-date"><CalendarCheck size={16}/>{pretty(today,{month:'short',day:'numeric',year:'numeric'})}</div></header>
      <div className="content">
        {view==='overview' && <>
          <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL PRODUCTIVITY SPACE</div><h1>Make tomorrow <span>count.</span></h1><p className="subheading">Plan your day with intention. Track what gets done. Learn from every week.</p></div><button className="primary-btn" onClick={()=>{setSelected(tomorrow);setShowAdd(true)}}><Plus size={18}/> Plan tomorrow</button></section>
          <section className="stats-grid">
            <Stat icon={ListTodo} label="Tasks planned" value={totalTasks} note="Across all saved days" color="blue"/>
            <Stat icon={CalendarCheck} label="Tasks completed" value={completedTasks} note={`${totalTasks?Math.round(completedTasks/totalTasks*100):0}% overall completion`} color="green"/>
            <Stat icon={Flame} label="Today's progress" value={`${dayStats(today).pct}%`} note={`${dayStats(today).done} of ${dayStats(today).total} tasks done`} color="orange"/>
          </section>
          <section className="dashboard-grid">
            <div className="panel day-panel">
              <div className="panel-heading"><div><div className="section-kicker">{planningDate}</div><h2>{pretty(selected,{weekday:'long',month:'long',day:'numeric'})}</h2></div><div className="date-arrows"><button aria-label="Previous day" onClick={()=>goDay(-1)}><ChevronLeft size={18}/></button><button aria-label="Next day" onClick={()=>goDay(1)}><ChevronRight size={18}/></button></div></div>
              <div className="day-progress"><div className="progress-copy"><span>Daily completion</span><b>{pct}%</b></div><div className="progress-track"><div className="progress-fill" style={{width:pct+'%'}}/></div><div className="progress-foot"><span>{done} completed</span><span>{tasks.length-done} remaining</span></div></div>
              <div className="task-header"><h3>Tasks for this day</h3><span>{tasks.length} {tasks.length===1?'task':'tasks'}</span></div>
              <div className="task-list">{tasks.length===0?<div className="empty-state"><div className="empty-icon"><ListTodo size={22}/></div><b>No tasks planned yet</b><p>Add a task and give your day a direction.</p><button className="text-btn" onClick={()=>setShowAdd(true)}><Plus size={15}/> Add your first task</button></div>:tasks.slice().sort((a,b)=>a.time.localeCompare(b.time)).map(t=><div className={`task-row ${t.done?'is-done':''}`} key={t.id}><button className="check-btn" onClick={()=>toggle(t.id)} aria-label={t.done?'Mark incomplete':'Mark complete'}>{t.done?<Check size={15}/>:<Circle size={19}/>}</button><div className="task-info"><strong>{t.title}</strong><div className="task-meta"><span className={`category-dot ${t.category.toLowerCase()}`}/>{t.category}<span className="meta-separator">·</span><Clock3 size={12}/>{t.time}</div></div><span className={`status ${t.done?'completed':'pending'}`}>{t.done?'Done':'To do'}</span><button className="delete-btn" onClick={()=>remove(t.id)} aria-label="Delete task"><Trash2 size={15}/></button></div>)}</div>
              <button className="add-task-btn" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add a task</button>
            </div>
            <div className="right-column">
              <div className="panel focus-panel"><div className="focus-top"><div><div className="section-kicker">YOUR DAILY SNAPSHOT</div><h2>Keep your<br/>momentum.</h2></div><div className="ring" style={{'--progress':pct+'%'}}><div><b>{pct}%</b><small>done</small></div></div></div><p>Every completed task is progress. Keep showing up, one day at a time.</p><div className="focus-bottom"><span><Check size={15}/>{done} finished</span><span><Clock3 size={15}/>{tasks.length-done} left</span></div></div>
              <div className="panel upcoming-panel"><div className="panel-heading compact"><div><div className="section-kicker">LOOKING AHEAD</div><h3>Next up</h3></div><button className="small-link" onClick={()=>{setSelected(tomorrow);setView('overview')}}>Tomorrow <ArrowUpRight size={14}/></button></div>{(plans[tomorrow]||[]).length===0?<p className="muted-copy">Your next day is a blank page. Start planning it.</p>:(plans[tomorrow]||[]).slice(0,3).map(t=><div className="upcoming-task" key={t.id}><span className="upcoming-time">{t.time}</span><span>{t.title}</span></div>)}</div>
            </div>
          </section>
        </>}
        {view==='weekly' && <Report title="Your week, in focus." subtitle="A simple look at your progress over the last 7 days." data={week} totals={weekTotals} period="Last 7 days" today={today}/>}
        {view==='monthly' && <Report title="Your month at a glance." subtitle="See your consistency and completed work throughout this month." data={month} totals={monthTotals} period={pretty(today,{month:'long',year:'numeric'})} today={today} monthly/>}
      </div>
      <footer>Made for intentional days <span>·</span> Your data stays in this browser for now</footer>
    </main>

    {showAdd&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}><div className="modal"><div className="modal-head"><div><div className="section-kicker">BUILD YOUR DAY</div><h2>Add a task</h2></div><button className="close-btn" onClick={()=>setShowAdd(false)}><X size={19}/></button></div><p className="modal-date">For {pretty(selected,{weekday:'long',month:'long',day:'numeric'})}</p><form onSubmit={addTask}><label>What do you want to get done?<input autoFocus required maxLength="120" placeholder="e.g. Finish project documentation" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="form-row"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Time<input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setShowAdd(false)}>Cancel</button><button className="primary-btn" type="submit"><Plus size={17}/> Save task</button></div></form></div></div>}
    {toast&&<div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}

function Stat({icon:Icon,label,value,note,color}){return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>}
function Report({title,subtitle,data,totals,period,today,monthly=false}){
  const pct=totals.total?Math.round(totals.done/totals.total*100):0;
  const active=data.filter(d=>d.total>0).length;
  return <><section className="welcome-row report-welcome"><div><div className="eyebrow"><span className="eyebrow-line"/> PROGRESS & REFLECTION</div><h1>{title}</h1><p className="subheading">{subtitle}</p></div><div className="period-pill"><CalendarDays size={16}/>{period}</div></section>
    <section className="stats-grid report-stats"><Stat icon={ListTodo} label="Tasks planned" value={totals.total} note={`${active} days with a plan`} color="blue"/><Stat icon={Check} label="Tasks completed" value={totals.done} note="Tasks marked as done" color="green"/><Stat icon={TrendingUp} label="Completion rate" value={`${pct}%`} note="Completed out of planned" color="orange"/></section>
    <section className="panel report-panel"><div className="panel-heading"><div><div className="section-kicker">{monthly?'DAILY BREAKDOWN':'DAY-BY-DAY BREAKDOWN'}</div><h2>{monthly?'Your daily activity':'Your last 7 days'}</h2></div><span className="report-legend"><i/> Completion</span></div><div className={`chart ${monthly?'month-chart':''}`}>{data.map(d=><div className="chart-col" key={d.date}><div className="bar-area"><div className="bar-track"><div className="bar-fill" style={{height:d.pct+'%'}} title={`${d.done} of ${d.total} completed`}/></div><span className="bar-value">{d.total?d.pct+'%':'—'}</span></div><span className={`chart-label ${d.date===today?'is-today':''}`}>{monthly?new Date(d.date+'T12:00:00').getDate():pretty(d.date,{weekday:'short'})}</span></div>)}</div><div className="chart-foot"><span><i className="legend-dot"/> Each bar represents that day's completion rate</span><span>{monthly?'Current month':'Today is '+pretty(today,{month:'short',day:'numeric'})}</span></div></section>
    <section className="panel insights-panel"><div className="insight-icon"><Sparkles size={18}/></div><div><h3>Your progress insight</h3><p>{totals.total===0?'Your report will come to life as you add tasks and mark them complete. Start with one small plan.':`You completed ${totals.done} out of ${totals.total} planned tasks (${pct}%). ${pct>=80?'Excellent consistency — keep building on this momentum.':pct>=50?'You are making progress. Review unfinished tasks and plan realistically for the next day.':'A plan is a guide, not pressure. Try setting fewer, clearer priorities for your next day.'}`}</p></div></section>
  </>;
}
export default App;