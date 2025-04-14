import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import IllustrationImg from "../../assets/illustration.png";
import LoricEduLogo from "../../assets/loric-edu/loric-edu-color.png";
import OpsLogo from "../../assets/school-logos/ops-logo.png";
import ApxLogo from "../../assets/school-logos/apx-school.png";

import { useAuth } from "../../context/AuthContext";

// 🔹 Firebase Modular SDK
import { collection, query, where, getDocs } from "firebase/firestore";
import { Typography } from "@mui/joy";
import { useSchoolId } from "hooks/useSchoolId";
import { dbMaster } from "../../firebase";

// ✅ Memoized SchoolLogo
const SchoolLogo = memo(() => {
  const schoolDomain = useMemo(() => {
    return window.location.hostname.split(".")[1] || "localhost";
  }, []);

  if (schoolDomain === "apxschool") {
    return (
      <img
        src={ApxLogo}
        alt="school-logo"
        height={100}
        style={{
          borderRadius: "50%",
          border: "2px solid orange",
          padding: "6px",
        }}
      />
    );
  } else if (schoolDomain === "orientpublicschool") {
    return (
      <img
        src={OpsLogo}
        alt="school-logo"
        height={100}
        style={{
          borderRadius: "50%",
          border: "2px solid orange",
          padding: "6px",
        }}
      />
    );
  } else {
    return <img src={LoricEduLogo} alt="school-logo" height={80} />;
  }
});

const FooterContent = memo(() => {
  return (
    <Box>
      <Typography level="body-sm" sx={{ mb: 2 }}>
        <span style={{ color: "#4A6CCD" }}>Loric Softwares</span> | Copyright 2017-2025. All Rights Reserved.
      </Typography>
    </Box>
  )
})

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState(false);

  const navigate = useNavigate();
  const { updateSchoolId } = useSchoolId();
  const { login, currentUser } = useAuth();

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("All fields are required!");
      return;
    }

    const schoolId = username.split("@")[1].split(".")[0];
    setLoading(true);
    try {
      const q = query(collection(dbMaster, "admin_users"), where("user_email", "==", username));
      const docSnap = await getDocs(q);
      if (!docSnap.empty) {
        await login(username, password);
        updateSchoolId(`school_${schoolId}`);
        navigate("/");
      } else {
        setError("User does not exist!");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) navigate("/");
  }, [currentUser, navigate]);

  return (
    <div className="login-container">
      <div className="left-section">
        <img src={IllustrationImg} alt="graphics" />
        <div>
          <h2>Welcome To E-School Dashboard</h2>
          <p>Manage and control students' records, fees, and more.</p>
        </div>
      </div>
      <div className="right-section">
        <div className="login-card" style={{ flex: 1 }}>
          <SchoolLogo />
          <p>Login To School Admin Panel</p>
          <form className="form-control" onSubmit={handleOnSubmit}>
            <FormControl sx={{ width: "100%", mb: 2 }} variant="outlined">
              <InputLabel>Username</InputLabel>
              <OutlinedInput
                type="email"
                value={username}
                placeholder="user@apxschool.org"
                onChange={(e) => setUsername(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <AccountCircleIcon />
                  </InputAdornment>
                }
                label="Username"
              />
            </FormControl>
            <FormControl sx={{ width: "100%", mb: 2 }} variant="outlined">
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                type={visibility ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setVisibility(!visibility)}>
                      {visibility ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
            <div className="auth-recovery">
              <FormGroup sx={{ ml: 1 }}>
                <FormControlLabel control={<Checkbox />} label="Remember me" />
              </FormGroup>
            </div>

            {error && <Box><p style={{ color: "red" }}>{error}</p></Box>}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={30} />
              </Box>
            )}

            <button disabled={loading}>Login</button>
          </form>
        </div>
        <FooterContent />
      </div>
    </div>
  );
}

export default Login;
