import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import AppointmentModal from './AppointmentModal';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const AppointmentScheduler = () => {
    const [events, setEvents] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [selectedDentist, setSelectedDentist] = useState('all');
    const [view, setView] = useState(Views.WEEK);
    const [date, setDate] = useState(new Date());

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // { start, end }
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Fetch Dentists (for filter)
    useEffect(() => {
        const fetchDentists = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/users?role=dentist');
                setDentists(res.data);
            } catch (err) {
                console.error("Error fetching dentists", err);
            }
        };
        fetchDentists();
    }, []);

    // Fetch Appointments
    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/appointments');
            const formattedEvents = res.data.map(apt => ({
                id: apt.id,
                title: `${apt.patient_name} - ${apt.notes || 'Checkup'}`,
                start: new Date(apt.start_time),
                end: new Date(apt.end_time),
                resourceId: apt.dentist_id,
                allDay: false,
                status: apt.status
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error("Error fetching appointments", err);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Filter Logic
    const filteredEvents = selectedDentist === 'all'
        ? events
        : events.filter(evt => evt.resourceId === parseInt(selectedDentist));

    // Conflict Checker
    const hasConflict = (start, end, dentistId, excludeEventId = null) => {
        return events.some(evt => {
            if (evt.id === excludeEventId) return false; // Don't conflict with self
            if (evt.status === 'cancelled') return false;
            if (dentistId && evt.resourceId !== dentistId) return false; // Different dentist

            // Check overlap
            // Overlap if (StartA < EndB) and (EndA > StartB)
            return (
                moment(start).isBefore(evt.end) &&
                moment(end).isAfter(evt.start)
            );
        });
    };

    const handleEventResize = async ({ event, start, end }) => {
        // Check conflict
        const dentistId = event.resourceId;
        if (hasConflict(start, end, dentistId, event.id)) {
            alert("Conflict detected! This time slot is already booked for this dentist.");
            return;
        }

        const confirmed = window.confirm(`Reschedule ${event.title} to ${moment(start).format('LT')} - ${moment(end).format('LT')}?`);
        if (confirmed) {
            // Optimistic update
            setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, start, end } : ev));
            try {
                // Should call API to update
                // await axios.put(`/api/appointments/${event.id}`, { start_time: start, end_time: end });
                console.log("Updated via API (Mock)");
            } catch (err) {
                console.error("Failed to update", err);
                fetchAppointments(); // Revert
            }
        }
    };

    const handleEventDrop = async ({ event, start, end }) => {
        const dentistId = event.resourceId;
        if (hasConflict(start, end, dentistId, event.id)) {
            alert("Conflict detected! This time slot is already booked for this dentist.");
            return;
        }
        const confirmed = window.confirm(`Move ${event.title} to ${moment(start).format('lll')}?`);
        if (confirmed) {
            setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, start, end } : ev));
            // API Call here
        }
    };

    const handleSelectSlot = ({ start, end }) => {
        setSelectedSlot({ start, end });
        setSelectedEvent(null);
        setModalOpen(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setSelectedSlot({ start: event.start, end: event.end });
        setModalOpen(true);
    };

    const handleSaveAppointment = async (data) => {
        // Data includes patient_id, dentist_id, notes, etc.
        // Final conflict check (though backend should also do it)
        if (hasConflict(selectedSlot.start, selectedSlot.end, parseInt(data.dentist_id), selectedEvent?.id)) {
            alert("Conflict detected for this dentist!");
            return;
        }

        try {
            if (selectedEvent) {
                // Update existing
                console.log("Updating...", data);
            } else {
                // Create New
                await axios.post('http://localhost:5001/api/appointments', {
                    ...data,
                    start_time: selectedSlot.start,
                    end_time: selectedSlot.end
                });
            }
            setModalOpen(false);
            fetchAppointments();
        } catch (err) {
            console.error("Error saving", err);
        }
    };

    return (
        <div className="h-screen p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Appointment Scheduler</h2>
                <div className="flex items-center gap-2">
                    <label>Filter by Dentist:</label>
                    <select
                        className="border p-1 rounded"
                        value={selectedDentist}
                        onChange={e => setSelectedDentist(e.target.value)}
                    >
                        <option value="all">All Dentists</option>
                        {dentists.map(d => (
                            <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                    </select>
                </div>
            </div>

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
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                style={{ height: 'calc(100vh - 100px)' }}
                eventPropGetter={(event) => ({
                    style: {
                        backgroundColor: event.status === 'confirmed' ? '#22c55e' : '#3b82f6',
                    }
                })}
            />

            {modalOpen && (
                <AppointmentModal
                    isOpen={modalOpen}
                    slot={selectedSlot}
                    event={selectedEvent}
                    dentists={dentists}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveAppointment}
                />
            )}
        </div>
    );
};

export default AppointmentScheduler;
