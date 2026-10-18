import React, { useState, useEffect } from 'react';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import dayjs from 'dayjs';
import api from '../lib/api';
import AppointmentModal from './AppointmentModal';
import { PageHeader } from './ui';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = dayjsLocalizer(dayjs);
const DnDCalendar = withDragAndDrop(Calendar);

export default function AppointmentScheduler() {
    const [events, setEvents] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [selectedDentist, setSelectedDentist] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        api.get('/api/users?role=dentist').then((r) => setDentists(r.data)).catch(console.error);
    }, []);

    const fetchAppointments = () => {
        api.get('/api/appointments')
            .then((res) => {
                setEvents(res.data.map((apt) => ({
                    id: apt.id,
                    title: `${apt.patient_name} — ${apt.notes || 'Checkup'}`,
                    start: new Date(apt.start_time),
                    end: new Date(apt.end_time),
                    resourceId: apt.dentist_id,
                    allDay: false,
                    status: apt.status,
                })));
            })
            .catch(console.error);
    };

    useEffect(() => { fetchAppointments(); }, []);

    const filteredEvents = selectedDentist === 'all' ? events : events.filter((e) => e.resourceId === parseInt(selectedDentist));

    const hasConflict = (start, end, dentistId, excludeId = null) =>
        events.some((e) =>
            e.id !== excludeId &&
            e.status !== 'cancelled' &&
            dentistId && e.resourceId === dentistId &&
            dayjs(start).isBefore(e.end) && dayjs(end).isAfter(e.start)
        );

    const moveEvent = async ({ event, start, end }) => {
        if (hasConflict(start, end, event.resourceId, event.id)) {
            alert('Conflict detected for this dentist!');
            return;
        }
        setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start, end } : e)));
        try {
            await api.put(`/api/appointments/${event.id}`, { start_time: start, end_time: end });
        } catch (e) {
            console.error('Failed to persist move', e);
            fetchAppointments();
        }
    };

    const selectSlot = ({ start, end }) => {
        setSelectedSlot({ start, end });
        setSelectedEvent(null);
        setModalOpen(true);
    };

    const selectEvent = (event) => {
        setSelectedEvent(event);
        setSelectedSlot({ start: event.start, end: event.end });
        setModalOpen(true);
    };

    const save = async (data) => {
        if (hasConflict(selectedSlot.start, selectedSlot.end, parseInt(data.dentist_id), selectedEvent?.id)) {
            alert('Conflict detected for this dentist!');
            return;
        }
        try {
            if (selectedEvent) {
                await api.put(`/api/appointments/${selectedEvent.id}`, { ...data });
            } else {
                await api.post('/api/appointments', { ...data, start_time: selectedSlot.start, end_time: selectedSlot.end });
            }
            setModalOpen(false);
            fetchAppointments();
        } catch (e) {
            console.error(e);
            alert('Failed to save appointment');
        }
    };

    return (
        <div className="h-full p-6 flex flex-col max-w-7xl mx-auto w-full">
            <PageHeader
                title="Appointment Scheduler"
                subtitle="Drag to reschedule. Click a slot to book."
                actions={
                    <select
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                        value={selectedDentist}
                        onChange={(e) => setSelectedDentist(e.target.value)}
                    >
                        <option value="all">All Dentists</option>
                        {dentists.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                    </select>
                }
            />

            <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200/70 p-3">
                <DnDCalendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    step={30}
                    timeslots={2}
                    selectable
                    resizable
                    onEventDrop={moveEvent}
                    onEventResize={moveEvent}
                    onSelectSlot={selectSlot}
                    onSelectEvent={selectEvent}
                    style={{ height: 'calc(100vh - 210px)' }}
                    eventPropGetter={(event) => ({
                        style: { backgroundColor: event.status === 'confirmed' ? '#10b981' : '#1f8da5', borderRadius: 6, border: 'none' },
                    })}
                />
            </div>

            {modalOpen && (
                <AppointmentModal
                    isOpen={modalOpen}
                    slot={selectedSlot}
                    event={selectedEvent}
                    dentists={dentists}
                    onClose={() => setModalOpen(false)}
                    onSave={save}
                />
            )}
        </div>
    );
}
