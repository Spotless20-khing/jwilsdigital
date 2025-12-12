document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize WOW.js for entrance animations
    new WOW().init();

    // 2. STICKY HEADER SCROLL LOGIC (New Addition)
    const header = document.getElementById('main-header');
    const scrollThreshold = 100; // Distance in pixels before header becomes solid

    window.addEventListener('scroll', function() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Paystack Configuration (SWITCHED TO LIVE MODE)
    // *** PASTE YOUR ACTUAL LIVE PUBLIC KEY HERE (Starts with pk_live_...) ***
    const PAYSTACK_PUBLIC_KEY = 'pk_live_49bf25182b74e52f2c21524d3cf2f6dbb4e014be'; 
    
    // Amount for Registration Fee: GH₵ 250.00 (Converted to Pesewas/Kobo: 250 * 100)
    const REGISTRATION_AMOUNT_KEDIS = 15200;
    const PAYMENT_CURRENCY = 'GHS';
    const PAYMENT_REF_PREFIX = 'JWILS-REG-LIVE';

    // 4. Get Form Elements
    const enrollmentForm = document.getElementById('enrollmentForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('form-message');

    // Helper function to generate a unique reference
    const generateRef = () => {
        return `${PAYMENT_REF_PREFIX}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    };

    // 5. Paystack Integration Function
    function payWithPaystack(name, email, phone, course) {
        // Create a unique reference for the transaction
        const paymentReference = generateRef();

        // Initialize Paystack Handler
        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: email,
            amount: REGISTRATION_AMOUNT_KEDIS, // In Pesewas/Kobo (250 GHS)
            currency: PAYMENT_CURRENCY,
            ref: paymentReference,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Full Name",
                        variable_name: "full_name",
                        value: name
                    },
                    {
                        display_name: "Phone Number",
                        variable_name: "phone",
                        value: phone
                    },
                    {
                        display_name: "Course",
                        variable_name: "course",
                        value: course
                    }
                ]
            },
            
            // --- Success Callback: Payment completed successfully ---
            callback: function(response) {
                // SUCCESS LOGIC: In a live environment, this payment is real.
                formMessage.classList.remove('text-danger');
                formMessage.classList.add('text-success');
                formMessage.innerHTML = `
                    <p class="mb-1">✅ Thank you, ${name}! Your registration and 150 payment is confirmed.</p>
                    <p class="mb-0">Transaction Ref: ${response.reference}</p>
                    <p class="small text-secondary fst-italic mt-2">Our admissions team will contact you within 24 hours to discuss the full enrollment fee ($\text{GH₵} 750$).</p>
                `;
                
                // Clear the form and reset button
                enrollmentForm.reset();
                enrollmentForm.classList.remove('was-validated'); 
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-lock me-2"></i> Pay GH₵ 150 to Register';
            },

            // --- Close Callback: User closed the modal ---
            onClose: function() {
                formMessage.classList.remove('text-success');
                formMessage.classList.add('text-danger');
                formMessage.innerHTML = "Payment was cancelled. Please try again to complete your GH₵ 150 registration fee.";
                
                // Re-enable the button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-lock me-2"></i> Pay GH₵ 150 to Register';
            }
        });

        // Open Paystack modal
        handler.openIframe();
    }

    // 6. Handle Form Submission
    enrollmentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Basic form validation check
        if (!enrollmentForm.checkValidity()) {
            formMessage.classList.add('text-danger');
            formMessage.innerHTML = 'Please fill out all required fields.';
            enrollmentForm.classList.add('was-validated');
            return;
        }

        // Gather necessary data
        const formData = new FormData(enrollmentForm);
        const name = formData.get('fullName');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const course = formData.get('course');
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Initializing Payment...';
        formMessage.innerHTML = '';
        
        // Call the Paystack payment function
        payWithPaystack(name, email, phone, course);
    });

    // 7. Smooth Scrolling for all CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
