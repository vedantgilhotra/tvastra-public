const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./src/config/config.env"});
const { ObjectID } = require("mongodb");
const db = mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });
const schema = mongoose.Schema;

const record_schema = new schema({
    date:{
        type: Date,
        required: true
    },
    title:{
        type:String,
        required: true
    },
    name:{
        type:String,
        required: true
    },
    uploads:{
        type: Array,
        required:true
    },
    record_type:{
        type:String,
        required: true
    }
})

const usersschema = new schema({
  name: {
    type: String,
    required: true
},
email: {
    type: String,
    required: true
},
password: {
    type: String,
    required: true
},
gender: {
    type: String,
    required: true
},
date: {
    type: String,
    required: true
},
number: {
    type: Number,
    required: true
},
house_number: {
    type: String,
    required: false
},
colony: {
    type: String,
    required: false
},
timezone: {
    type: String,
    required: false
},
city: {
    type: String,
    required: true
},
state: {
    type: String,
  requiredl:true
},
country: {
    type: String,
    required: true
},
is_doctor: {
    type: Boolean,
    required: true
},
profile_picture:{
    type:String
},

medical_records:[record_schema],

appointments:[{
    type: schema.Types.ObjectId,
    ref: 'appointment'
}],

is_admin:{
    type:Boolean,
    default:false
}

});

const doctor_details_schema = new schema({
    _id: {
        type: ObjectID,
        required:true
    },
    description: {
        type: String,
    },
    profile_picture: {
        type: String,
        required: true
    },
    hospitals: {
        type: Array,
        required:true
    },
    achievements: {
        type: Array
    },
    experience: {
        type: Number,
        required: true
    },
    qualifications: {
        type: Array,
        required: true
    },
    awards: {
        type: Array
    },
    treatments:{
        type:Array
    },
    specializations: {
        type: Array,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    schedules: [{
        type: schema.Types.ObjectId,
        ref: 'schedule'
    }],
    appointments:[{
        type: schema.Types.ObjectId,
        ref: 'appointment'
    }]
});

const slot_schema = new schema({
    start_time:{
        type: Date,
        required: true
    },
    end_time:{
        type: Date,
        required:true
    },
    is_occupied:{
        type:Boolean,
        required:true,
        default:false
    },
    is_active:{
        type:Boolean,
        default:true
    },
    booked_for:{
        type:Array
    }
});

const schedules_schema = new schema({
    
    hospital:{
        type: String,
        required: true
    },
    doctor_id:{
        type: schema.Types.ObjectId,
        required:true
    },
    day:{
        type: String,
        required:true
    },
    start_time:{
        type: Date,
        required:true
    },
    end_time:{
        type:Date,
        required:true
    },
    interval:{
        type: Number,
        required:true
    },
    is_active:{
        type: Boolean,
        default: true
    },
    slots:[slot_schema]

});

const appointment_schema = new schema({

    schedule_id:{
        type:ObjectID,
        required:true
    },
    slot_id:{
        type:ObjectID,
        required:true
    },
    doctor_id:{
        type:ObjectID,
        required:true
    },
    user_id:{
        type:schema.Types.ObjectId,
        required: true
    },
    booking_date:{
        type: Date,
        required:true
    },
    patient_name:{
        type: String,
        required:true
    },
    patient_number:{
        type: Number,
        required:true
    },
    patient_email:{
        type: String,
        required:true
    },
    start_time:{
        type:Date,
        required:true
    },
    end_time:{
        type:Date,
        required: true
    }

})


module.exports = {
  Users: mongoose.model('Users',usersschema),
  Doctor_details: mongoose.model('Doctor_details',doctor_details_schema),
  Schedules:mongoose.model('schedule',schedules_schema),
  Appointments:mongoose.model('appointment',appointment_schema)
}