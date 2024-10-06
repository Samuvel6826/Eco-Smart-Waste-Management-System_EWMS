// import React, { useState, useEffect } from 'react';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { Button, Form } from 'react-bootstrap';
// import Menubar from '../common/Menubar'; // Assuming Menubar is the correct path
// import axios from 'axios';
// // import { toast } from 'react-toastify';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useLogout } from '../hooks/useLogout';

// const ChangePassword = () => {
//   const token = sessionStorage.getItem('token');
//   const navigate = useNavigate();
//   const params = useParams();
//   const { id } = params;
//   const logout = useLogout();

//   // Validation schema using Yup
//   const validationSchema = Yup.object().shape({
//     password: Yup.string().required('New Password is required').min(1, 'Password must be at least 1 character'),
//     confirmPassword: Yup.string()
//       .oneOf([Yup.ref('password'), null], 'Passwords must match')
//       .required('Confirm Password is required'),
//   });

//   // Formik hook for managing form state and submission
//   const formik = useFormik({
//     initialValues: {
//       password: '',
//       confirmPassword: '',
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       try {
//         // Make the request to update the password
//         const res = await axios.put(
//           `${process.env.VITE_SERVER_HOST_URL}/users/change-password/${id}`,
//           {
//             password: values.password,
//           },
//           {
//             headers: {
//               authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         // Check if the request was successful
//         if (res.status === 200) {
//           // toast.success(res.data.message);
//           // Redirect to the dashboard after successful submission
//           navigate('/dashboard');
//         }
//       } catch (error) {
//         // Handle errors during the update process
//         // toast.error(
//         //   error.response?.data?.errorMessage || error.response?.data?.message || 'Error updating password'
//         // );
//         // Logout the user if the request is unauthorized
//         if (error.response?.status === 401) {
//           logout();
//         }
//       }
//     },
//   });

//   return (
//     <>
//       <div>
//         {/* Display the Menubar with the title 'Change Password' */}
//         <Menubar title={'Change Password'} />
//         <h2 style={{ textAlign: 'center', margin: '1rem 0 2rem 0' }}>Change Password</h2>
//         <div className="container-fluid" style={{ width: '60%', margin: '0 auto' }}>
//           {/* Formik form for password change */}
//           <Form onSubmit={formik.handleSubmit}>
//             {/* Input field for new password */}
//             <Form.Group className="mb-3">
//               <Form.Label htmlFor="password">New Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 name="password"
//                 placeholder="Enter New Password"
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 value={formik.values.password}
//               />
//               {/* Display error message if the password field is touched and has an error */}
//               {formik.touched.password && formik.errors.password && (
//                 <div className="error" style={{ color: 'red' }}>
//                   {formik.errors.password}*
//                 </div>
//               )}
//             </Form.Group>

//             {/* Input field for confirming new password */}
//             <Form.Group className="mb-3">
//               <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 name="confirmPassword"
//                 placeholder="Confirm New Password"
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 value={formik.values.confirmPassword}
//               />
//               {/* Display error message if the confirmPassword field is touched and has an error */}
//               {formik.touched.confirmPassword && formik.errors.confirmPassword && (
//                 <div className="error" style={{ color: 'red' }}>
//                   {formik.errors.confirmPassword}*
//                 </div>
//               )}
//             </Form.Group>

//             {/* Submission button */}
//             <div className="text-center">
//               <Button variant="primary" type="submit" style={{ width: '35%' }}>
//                 {/* Display loader while submitting or 'Submit' text otherwise */}
//                 {formik.isSubmitting ? 'Submitting...' : 'Submit'}
//               </Button>
//             </div>
//           </Form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ChangePassword;
