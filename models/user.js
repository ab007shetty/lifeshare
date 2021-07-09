const mongoose = require('mongoose');
const schema = mongoose.Schema;
var mySchema = new schema(
  {
    name: {
      type: String,
      required: [true, 'Please Enter Your Name.'],
      uppercase: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      validate: {
        validator: function (v) {
          return /(A|B|AB|O)[+-]/.test(v);
        },
        message: (props) => `${props.value} Please Enter Valid Blood Group!`,
      },
      required: [true, 'Please Enter Your Blood Group.'],
      uppercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please Enter Main City Name.'],
      uppercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please Enter Valid number.'],
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model('user', mySchema);

module.exports = UserModel;
