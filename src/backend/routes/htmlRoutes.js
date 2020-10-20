const htmlController = require("../controller/htmlController");
const loginController = require("../controller/loginController");
const doctor_filter_controller = require("../controller/doctor_filters_controller");
const admin_panel_controller = require("../controller/admin_panel_controller");
const express = require("express");
const middle = require("../controller/middle");
const { get } = require("mongoose");
const router = express.Router();

router.route("/").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.index);

router.route("/doctor").get(middle.sessionnotactive,middle.doctor_details_added,middle.dynamic_filters_doctor,htmlController.doctor);

router.route("/otp_login_number").get(middle.sessioncheck,htmlController.otp_login_number);

router.route("/otp_login_number").post(loginController.otp_login_number);

router.route("/otp_login_otp").get(middle.sessioncheck,middle.otp_sent,htmlController.otp_login_otp);

router.route("/otp_login_otp").post(loginController.otp_login_otp);

router.route("/resend_otp_login").get(loginController.resend_otp_login);

router.route("/hospital").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.hospital);

router.route("/signup").get(middle.sessioncheck,htmlController.signup);

router.route("/signup").post(middle.alreadyregistered_email,middle.alreadyregistered_number,loginController.signup);

router.route("/contactus").get(middle.sessionnotactive,htmlController.contactus);

router.route("/dentistry").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.dentistry);

router.route("/appointment").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.appointment);

router.route("/aboutus").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.aboutus);

router.route("/doctor_profile").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.doctor_profile);

router.route("/faq").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.faq);

router.route("/hospital_profile").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.hospital_profile);

router.route("/submit_query").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.submit_query);

router.route("/plus").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.plus);

router.route("/email_login").get(middle.sessioncheck,htmlController.email_login);

router.route("/email_login").post(loginController.email_login);

router.route("/logout").get(middle.sessionnotactive,htmlController.logout);

router.route("/forgot_password_email").get(middle.sessioncheck,htmlController.forgot_password_email);

router.route("/forgot_password_email").post(middle.sessioncheck,loginController.forgot_password_email);

router.route("/forgot_password_otp").post(middle.sessioncheck,loginController.forgot_password_otp);

router.route("/forgot_password_otp").get(middle.sessioncheck,middle.otp_sent,htmlController.forgot_password_otp);

router.route("/resend_otp").get(middle.sessioncheck,loginController.resend_otp);

router.route("/update_password").get(middle.sessioncheck,htmlController.update_password);

router.route("/update_password").post(loginController.update_password);

router.route("/doctor_details_form").get(middle.sessionnotactive,middle.is_doctor,htmlController.doctor_details_form);

router.route("/doctor_details_form").post(middle.is_doctor,loginController.doctor_details_form);

router.route("/user_profile_edit").get(middle.sessionnotactive,middle.is_user_only,htmlController.user_profile_edit);

router.route("/user_profile_edit").post(loginController.user_profile_edit);

router.route("/doctor_profile_edit").get(middle.sessionnotactive,middle.is_doctor,middle.doctor_details_added,htmlController.doctor_profile_edit);

router.route("/doctor_profile_edit").post(loginController.doctor_profile_edit);

router.route("/doctor_create_schedule").get(middle.sessionnotactive,middle.is_doctor,htmlController.doctor_create_schedule);

router.route("/doctor_create_schedule").post(loginController.doctor_create_schedule);

router.route("/doctor_remove_schedule").get(middle.sessionnotactive,middle.is_doctor,loginController.doctor_remove_schedule);

router.route("/toggle_schedule_active_state").get(middle.sessionnotactive,middle.is_doctor,loginController.toggle_schedule_active_state);

router.route("/toggle_schedule_inactive_state").get(middle.sessionnotactive,middle.is_doctor,loginController.toggle_schedule_inactive_state);

router.route("/toggle_slot_inactive_state").get(middle.sessionnotactive,middle.is_doctor,loginController.toggle_slot_inactive_state);

router.route("/toggle_slot_active_state").get(middle.sessionnotactive,middle.is_doctor,loginController.toggle_slot_active_state);

router.route("/location_filter_change_add").get(middle.sessionnotactive,doctor_filter_controller.location_filter_change_add);

router.route("/treatment_filter_change_add").get(middle.sessionnotactive,doctor_filter_controller.treatment_filter_change_add);

router.route("/hospital_filter_change_add").get(middle.sessionnotactive,doctor_filter_controller.hospital_filter_change_add);

router.route("/experience_filter_change_add").get(middle.sessionnotactive,doctor_filter_controller.experience_filter_change_add);

router.route("/location_filter_change_remove").get(middle.sessionnotactive,doctor_filter_controller.location_filter_change_remove);

router.route("/treatment_filter_change_remove").get(middle.sessionnotactive,doctor_filter_controller.treatment_filter_change_remove);

router.route("/hospital_filter_change_remove").get(middle.sessionnotactive,doctor_filter_controller.hospital_filter_change_remove);

router.route("/experience_filter_change_remove").get(middle.sessionnotactive,doctor_filter_controller.experience_filter_change_remove);

router.route("/sort_doctors").post(middle.sessionnotactive,doctor_filter_controller.sort_doctors);

router.route("/medical_records").get(middle.sessionnotactive,htmlController.medical_records);

router.route("/medical_records").post(middle.sessionnotactive,loginController.medical_records);

router.route("/medical_record_delete").post(middle.sessionnotactive,loginController.medical_record_delete);

router.route("/medical_record_display").get(middle.sessionnotactive,htmlController.medical_record_display);

router.route("/medical_record_display").post(middle.sessionnotactive,loginController.medical_record_display);

router.route("/medical_record_display_delete").get(middle.sessionnotactive,loginController.medical_record_display_delete);

router.route("/get_doctor_available_slots").get(middle.sessionnotactive,loginController.get_doctor_available_slots);

router.route("/book_appointment").get(middle.sessionnotactive,htmlController.book_appointment);

router.route("/book_appointment").post(middle.sessionnotactive,loginController.book_appointment);

router.route("/booking_status").get(middle.sessionnotactive,middle.booking_made,htmlController.booking_status);

router.route("/cancel_last_booking").get(middle.sessionnotactive,middle.check_booking_made,loginController.cancel_last_booking);

router.route("/reschedule_last_booking").get(middle.sessionnotactive,middle.check_booking_made,htmlController.reschedule_last_booking);

router.route("/confirm_reschedule_last_booking").get(middle.sessionnotactive,loginController.confirm_reschedule_last_booking);

router.route("/all_appointments").get(middle.sessionnotactive,middle.doctor_details_added,htmlController.all_appointments);

router.route("/temp").get(htmlController.temp);

router.route("/cancel_appointment").post(middle.sessionnotactive,loginController.cancel_appointment);

router.route("/reschedule_appointment").post(middle.sessionnotactive,htmlController.reschedule_appointment);

router.route("/change_password_settings").get(middle.sessionnotactive,htmlController.change_password_settings);

router.route("/change_password_settings").post(middle.sessionnotactive,loginController.change_password_settings);

//admin panel routes

router.route("/admin_panel_home").get(middle.sessionnotactive,middle.verify_admin,admin_panel_controller.admin_panel_home);

module.exports = {
    router:router
};