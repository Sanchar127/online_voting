'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'; 

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      const response = await axios.post('/api/contact', formData);
      if (response.status === 200) {
        setSubmissionStatus('Your message has been sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        setTimeout(() => {
          router.push('/'); // Redirect to home page after success
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionStatus('There was an error sending your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-gray-200 min-h-screen py-12 px-8 font-sans text-gray-900">
      {/* Header Section */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold text-indigo-700">Contact Us</h1>
       <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
  {"We'd love to hear from you! Please fill out the form below or reach out to us through the contact details provided."}
</p>

      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form Section */}
        <section className="bg-white p-8 rounded-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="name" className="block font-semibold text-lg mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Full Name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="block font-semibold text-lg mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your Email Address"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject" className="block font-semibold text-lg mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Subject of Your Message"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="block font-semibold text-lg mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Write your message here..."
                required
                value={formData.message}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-md text-lg font-semibold shadow-xl transition duration-300 ease-in-out transform hover:scale-105 hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {/* Status Message */}
          {submissionStatus && (
            <div className={`mt-4 text-center ${submissionStatus.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
              <p>{submissionStatus}</p>
            </div>
          )}
        </section>

        {/* Contact Information Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-indigo-700">Contact Information</h2>
          <ul className="space-y-6 text-lg text-gray-700">
            <li className="flex items-center space-x-4">
              <FaEnvelope className="text-indigo-500" />
              <span>Email: <a href="mailto:contact@votingsystem.com" className="text-indigo-500 hover:text-indigo-600">municipality374@votingsystem.com</a></span>
            </li>
            <li className="flex items-center space-x-4">
              <FaPhoneAlt className="text-indigo-500" />
              <span>Phone: <a href="tel:+1234567890" className="text-indigo-500 hover:text-indigo-600">+123 456 7890</a></span>
            </li>
            <li className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-indigo-500" />
              <span>Address: Munipality344, District, World 56789</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Contact;
