// booking-system.js - نظام إدارة الحجوزات
class BookingSystem {
    constructor() {
        this.availableSlots = this.generateSlots();
        this.bookings = this.loadBookings();
        this.init();
    }

    init() {
        this.setupBookingListeners();
        this.updateBookingDisplay();
    }

    generateSlots() {
        const slots = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const startHour = 8;
        const endHour = 22;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            for (let hour = startHour; hour < endHour; hour++) {
                if (Math.random() > 0.3) { // 70% من المواعيد متاحة
                    slots.push({
                        id: `slot_${i}_${hour}`,
                        date: date.toDateString(),
                        time: `${hour}:00 - ${hour + 1}:00`,
                        datetime: date,
                        available: true,
                        tutor: this.getRandomTutor()
                    });
                }
            }
        }
        return slots;
    }

    getRandomTutor() {
        const tutors = ['Fatima S.', 'Khalid M.', 'Ahmed Y.', 'Mona R.'];
        return tutors[Math.floor(Math.random() * tutors.length)];
    }

    setupBookingListeners() {
        // سيتم تفعيله في الصفحات المناسبة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('book-slot')) {
                const slotId = e.target.dataset.slotId;
                this.showBookingModal(slotId);
            }
        });
    }

    showBookingModal(slotId) {
        const slot = this.availableSlots.find(s => s.id === slotId);
        if (!slot) return;

        const modalHTML = `
            <div class="booking-modal active" id="bookingModal">
                <div class="modal-content">
                    <h3>Book Your Lesson</h3>
                    <div class="slot-info">
                        <p><strong>Date:</strong> ${slot.date}</p>
                        <p><strong>Time:</strong> ${slot.time}</p>
                        <p><strong>Tutor:</strong> ${slot.tutor}</p>
                    </div>
                    <form id="bookingForm">
                        <input type="text" name="name" placeholder="Full Name" required>
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="tel" name="phone" placeholder="Phone" required>
                        <textarea name="goals" placeholder="Learning Goals" rows="3"></textarea>
                        <button type="submit" class="btn btn-primary">Confirm Booking</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmBooking(slotId, new FormData(e.target));
        });
    }

    confirmBooking(slotId, formData) {
        const booking = {
            id: 'booking_' + Date.now(),
            slotId: slotId,
            studentName: formData.get('name'),
            studentEmail: formData.get('email'),
            studentPhone: formData.get('phone'),
            goals: formData.get('goals'),
            bookedAt: new Date().toISOString(),
            status: 'confirmed'
        };

        this.bookings.push(booking);
        this.saveBookings();
        
        // تحديث حالة الموعد
        const slot = this.availableSlots.find(s => s.id === slotId);
        if (slot) slot.available = false;
        
        this.showConfirmation(booking);
        this.closeModal();
    }

    showConfirmation(booking) {
        alert(`✅ Booking confirmed! We've sent details to ${booking.studentEmail}`);
        
        // تتبع التحويل
        if (window.analytics) {
            window.analytics.trackConversion('lesson_booking', 1);
        }
    }

    closeModal() {
        const modal = document.getElementById('bookingModal');
        if (modal) modal.remove();
    }

    saveBookings() {
        localStorage.setItem('ara_bookings', JSON.stringify(this.bookings));
    }

    loadBookings() {
        return JSON.parse(localStorage.getItem('ara_bookings') || '[]');
    }

    updateBookingDisplay() {
        // تحديث عرض المواعيد المتاحة في الصفحة
        const container = document.getElementById('availableSlots');
        if (container) {
            const available = this.availableSlots.filter(slot => slot.available);
            container.innerHTML = available.map(slot => `
                <div class="time-slot">
                    <span>${slot.date} - ${slot.time}</span>
                    <span>Tutor: ${slot.tutor}</span>
                    <button class="btn book-slot" data-slot-id="${slot.id}">Book</button>
                </div>
            `).join('');
        }
    }
}

if (typeof window !== 'undefined') {
    window.BookingSystem = BookingSystem;
}