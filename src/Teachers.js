const teachersArray = [
  {
    id: "5555465",
    faculty_name: "Rakesh Kumar",
    faculty_specification: "Assistant teacher SST.",
    faculty_phone: "9939613718",
    faculty_aadhar: "416978807021",
    faculty_gender: "male",
    faculty_qualification: "M.A B.Ed (geography)",
    faculty_address:
      "Vishwanath nurshing home,Near Kali Manda, Panch Mandir,Barmasiya,Giridih,Jharkhand - 815301",
    faculty_image_thumb:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Frakesh_sir_thumb.png?alt=media&token=394a9fc7-cd7a-4f73-bec0-2fdb66d41d47",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Frakesh_sir.jpg?alt=media&token=f6e978cf-17d2-4f8c-b5d8-e6709ada1273",
  },
  {
    id: "265665",
    faculty_name: "Praveen Kumar",
    faculty_specification: "Science Teacher",
    faculty_phone: "6203019769",
    faculty_gender: "male",
    faculty_aadhar: "",
    faculty_qualification: "M.A B.Ed (History)",
    faculty_address: "Sihidih,Kabir Gyan Mandir,Giridih,Jharkhand - 815301",
    faculty_image_thumb:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fpraveen_sir_thumb.png?alt=media&token=0f643307-e67a-4c7c-b1c0-cad83fad2cdd",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fpraveen_sir.jpg?alt=media&token=b3847a2b-cdab-4fe3-951e-0c17ff39cec8",
  },
  {
    id: "424242",
    faculty_name: "Priya Kumari",
    faculty_specification: "Maths Teacher",
    faculty_phone: "7766081598",
    faculty_gender: "female",
    faculty_aadhar: "",
    faculty_qualification: "M.A",
    faculty_address:
      "At- Nawadih, P.O-Sonardih, P.J-Jamua, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fpriya_mam.png?alt=media&token=2b943e5d-99d1-48a8-99d3-e576485886c6",
  },
  {
    id: "4244343",
    faculty_name: "Md. Akhlaque Ansari",
    faculty_specification: "Assistant Teacher Maths",
    faculty_phone: "7870238423",
    faculty_gender: "male",
    faculty_aadhar: "425299808237",
    faculty_qualification: "B.A",
    faculty_address: "Barwadih, Gandhi Gali, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fmd_akhlaque_ansari.jpg?alt=media&token=5630766b-8c4e-45d8-ae3b-2b5453f87877",
  },
  {
    id: "4244343",
    faculty_name: "Avinash Kumar Saw",
    faculty_specification: "Maths Teacher",
    faculty_phone: "9199736005",
    faculty_gender: "male",
    faculty_aadhar: "",
    leader: true,
    faculty_qualification: "M.A, B.Ed, Jharkhand TET Quialified",
    faculty_address: "Kalyandih,P.O -Pachamba, Giridih, Jharkhand-815312",
    faculty_image_thumb:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fabhinash_kumar_saw_thumb.png?alt=media&token=3299527c-62f8-4344-8bd4-135c7be0b630",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fabhinash_kumar_saw-removebg.png?alt=media&token=793cd1a7-58be-47a5-8f74-d56adc96e161",
  },
  {
    id: "6565554",
    faculty_name: "Surendra Pd. Yadav",
    faculty_specification: "Maths Teacher",
    faculty_phone: "9572572581",
    faculty_gender: "male",
    faculty_aadhar: "",
    faculty_qualification: "M.A",
    faculty_address: "Ledwaradih, PO - Sonardih, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fsurendra_pd_yadav.jpg?alt=media&token=24fa0e05-9d64-442a-a8e4-c99b0b83002c",
  },
  {
    id: "5466644",
    faculty_name: "Kajal Kumari",
    faculty_specification: "Hindi Teacher",
    faculty_phone: "6299409080",
    faculty_gender: "female",
    faculty_aadhar: "",
    faculty_qualification: "M.A",
    faculty_address: "Shasti Nagar, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fkajal_kumari.jpg?alt=media&token=afd1fcfe-b52a-4780-aa39-034dc72cfe9d",
  },
  {
    id: "945151",
    faculty_name: "Kundan Kumar",
    faculty_specification: "English Teacher",
    faculty_phone: "62998220529",
    faculty_gender: "male",
    faculty_aadhar: "",
    faculty_qualification: "B.A (History)",
    faculty_address:
      "At-Siyatand,P.O-Siyatand,Jamua, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fkundan_kumar.jpg?alt=media&token=fbf68803-12c4-41f6-bb4a-05435da6dc7f",
  },
  {
    id: "656644",
    faculty_name: "Shrishti Kumari",
    faculty_specification: "Hindi Teacher",
    faculty_phone: "9798471369",
    faculty_gender: "female",
    faculty_aadhar: "",
    faculty_qualification: "M.A",
    faculty_address:
      "At-Patardih,P.O-Sonardih,Jamua, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fshrishti_kumari.jpg?alt=media&token=164cb917-3884-48a8-8dc4-35b07abc4af2",
  },
  {
    id: "456565",
    faculty_name: "Umakant Verma",
    faculty_specification: "Math/Hindi/English Teacher",
    faculty_phone: "9709298390",
    faculty_gender: "male",
    faculty_aadhar: "",
    faculty_qualification: "B.A(D.EL.Ed)",
    faculty_address:
      "At-Siyatand,P.O-Siyatand,Jamua, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fuma.jpg?alt=media&token=e91c5082-bfed-47fb-b8f4-48f45b1e918a",
  },
  {
    id: "9891154",
    faculty_name: "Saibun Nisha",
    faculty_specification: "Math/Hindi Teacher",
    faculty_phone: "9693155930",
    faculty_gender: "female",
    faculty_aadhar: "",
    faculty_qualification: "M.A(Pol. Sci)",
    faculty_address: "Barwadih, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/facultyProfiles%2Fsaibun_nisha.jpg?alt=media&token=ae00f514-caab-4f9e-abbd-771c4fcc3cb3",
  },
  {
    id: "65665",
    faculty_name: "Sandeep Gupta",
    faculty_specification: "_ Teacher",
    faculty_phone: "6200694373",
    faculty_gender: "male",
    faculty_aadhar: "",
    faculty_qualification: "B.Sc,B.Ed,MARD",
    faculty_address: "At-Bengabad, Giridih, Jharkhand-815312",
    faculty_image:
      "https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/Dummy%20Images%2Fdmmy_profile_male.png?alt=media&token=8ac49105-26a7-4ca4-9eef-c6901b63a2c3",
  },
];

export default teachersArray;
