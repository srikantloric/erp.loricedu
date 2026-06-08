import { Button, Divider, Modal, Sheet, Stack, Typography, Avatar, Badge } from "@mui/joy";
import { useSearchDialog } from "context/SearchDialogContext";
import {
  AddSquare,
  Bubble,
  MoneyRecive,
  Notepad2,
  SearchNormal1,
} from "iconsax-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "store";

function SearchDialog() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isOpen, closeDialog } = useSearchDialog();
  const [query, setQuery] = useState("");
  const students = useSelector((state: RootState) => state.students.studentarray || []);

  const MODULES = useMemo(
    () => [
      { title: "Fee Collection", path: "/fee-management" },
      { title: "Attendance", path: "/attendance" },
      { title: "Student Management", path: "/students/view" },
      { title: "Exam Results", path: "/exams" },
    ],
    [],
  );

  const studentMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return students
      .filter((s: any) => {
        return (
          (s.student_name || "").toLowerCase().includes(q) ||
          (s.admission_no || "").toLowerCase().includes(q) ||
          (s.student_id || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [students, query]);

  const moduleMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return MODULES.filter((m) => m.title.toLowerCase().includes(q));
  }, [MODULES, query]);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      console.log(inputRef.current);
      inputRef.current.focus();
    }
  }, [isOpen]);

  const redirectToPage = (page: string) => {
    navigate(page);
    closeDialog();
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={isOpen}
      onClose={() => closeDialog()}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "& .MuiSheet-root:focus": {
          outline: "none",
        },

        "& .MuiModal-backdrop": {
          backdropFilter: "blur(1px)", // Adjust the blur value here
        },
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "50vw",
          height: "70%",
          borderRadius: "lg",
          boxShadow: "lg",
        }}
      >
        <Stack
          justifyContent={"space-between"}
          direction={"row"}
          sx={{ p: "1rem" }}
          alignItems={"center"}
        >
          <SearchNormal1 size={18} color="var(--bs-primary)" />
          <input
            style={{
              border: "none",
              flex: 1,
              marginRight: "0.5rem",
              marginLeft: "0.5rem",
              height: "30px",
              padding: "8px",
              backgroundColor: "#FBFCFE",
              outline: "none",
              fontSize: "16px",
            }}
            ref={inputRef}
            autoFocus={true}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, modules, actions..."
          />
          <Button
            variant="soft"
            size="sm"
            color="neutral"
            onClick={() => closeDialog()}
            sx={{
              height: "0.2rem",
              "&.MuiButton-root": {
                fontSize: "0.7rem",
              },
            }}
          >
            ESC
          </Button>
        </Stack>
        <Divider />
        <Stack direction="column" padding="1rem">
          {query.trim().length >= 2 ? (
            <>
              {studentMatches.length > 0 && (
                <>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography level="body-sm" fontWeight={600} sx={{ color: "var(--bs-gray-500)" }}>
                      Students
                    </Typography>
                    <Button variant="plain" size="sm" onClick={() => redirectToPage(`/students/view?search=${encodeURIComponent(query)}`)}>
                      View all
                    </Button>
                  </Stack>

                  {studentMatches.map((s: any) => (
                    <Button
                      key={s.id}
                      onClick={() => redirectToPage(`/students/profile/${s.id}`)}
                      variant="plain"
                      sx={{ justifyContent: "flex-start", textTransform: "none", py: 1 }}
                    >
                      <Avatar sx={{ mr: 1, bgcolor: "neutral.300" }}>{(s.student_name || "?").charAt(0)}</Avatar>
                      <Stack direction="column" alignItems="flex-start" sx={{ flex: 1 }}>
                        <Typography level="body-md" fontWeight={500}>{s.student_name}</Typography>
                        <Typography level="body-xs" sx={{ color: "var(--bs-gray-500)" }}>
                          Class {s.classId || s.class} • Roll No: {s.rollNumber || "-"} • Admission No: {s.admission_no || "-"}
                        </Typography>
                      </Stack>
                      <Badge color="success" variant="soft" sx={{ ml: 1 }}>{s.is_active ? "Active" : "Inactive"}</Badge>
                    </Button>
                  ))}
                </>
              )}

              {moduleMatches.length > 0 && (
                <>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, mb: 1 }}>
                    <Typography level="body-sm" fontWeight={600} sx={{ color: "var(--bs-gray-500)" }}>
                      Modules
                    </Typography>
                  </Stack>
                  {moduleMatches.map((m) => (
                    <Button key={m.path} variant="plain" sx={{ justifyContent: "flex-start", textTransform: "none" }} onClick={() => redirectToPage(m.path)}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Notepad2 size={18} color="var(--bs-primary)" />
                        <Typography>{m.title}</Typography>
                      </Stack>
                    </Button>
                  ))}
                </>
              )}

              {studentMatches.length === 0 && moduleMatches.length === 0 && (
                <Typography level="body-sm" sx={{ color: "var(--bs-gray-500)" }}>No results for “{query}”</Typography>
              )}
            </>
          ) : (
            // show default quick actions when there is no query
            <Stack direction="row" justifyContent="space-between" gap="1rem">
              <Stack direction="column" flex={1}>
                <Typography level="body-sm" fontWeight="500" sx={{ m: "0.6rem", color: "var(--bs-gray-500)", fontSize: "13px" }}>
                  PAYMENTS
                </Typography>
                <Button onClick={() => redirectToPage("/FeeManagement")} sx={{ flex: 1, backgroundColor: "rgba(246, 247, 248, 0.4)", border: "1px solid rgba(232, 234, 238, 0.5)", textAlign: "left", "&.MuiButton-root": { height: "42px", justifyContent: "flex-start", padding: "12px", color: "rgb(0, 107, 214)" }, "&.MuiButton-root:hover": { border: "1px solid var(--bs-primary)" }, "--Button-gap": "14px" }} color="primary" variant="outlined" size="sm" startDecorator={<MoneyRecive color="rgb(0, 115, 230)" opacity="0.6" size="20" />}>Recieve Payemts</Button>
                <Button onClick={() => redirectToPage("/Accountings")} sx={{ mt: "0.5rem", flex: 1, backgroundColor: "rgba(246, 247, 248, 0.4)", border: "1px solid rgba(232, 234, 238, 0.5)", textAlign: "left", "&.MuiButton-root": { height: "42px", justifyContent: "flex-start", padding: "12px", color: "rgb(0, 107, 214)" }, "&.MuiButton-root:hover": { border: "1px solid var(--bs-primary)" }, "--Button-gap": "14px" }} color="primary" variant="outlined" size="sm" startDecorator={<Notepad2 color="rgb(0, 115, 230)" opacity="0.6" size="20" />}>Generate Challans</Button>
              </Stack>

              <Stack direction="column" flex={1}>
                <Typography level="title-sm" fontWeight="500" sx={{ m: "0.6rem", color: "var(--bs-gray-500)", fontSize: "13px" }}>ADMISSION</Typography>
                <Button sx={{ flex: 1, backgroundColor: "rgba(246, 247, 248, 0.4)", border: "1px solid rgba(232, 234, 238, 0.5)", textAlign: "left", "&.MuiButton-root": { height: "42px", justifyContent: "flex-start", padding: "12px", color: "rgb(0, 107, 214)" }, "&.MuiButton-root:hover": { border: "1px solid var(--bs-primary)" }, "--Button-gap": "14px" }} color="primary" variant="outlined" size="sm" startDecorator={<AddSquare color="rgb(0, 115, 230)" opacity="0.6" size="20" />}>Student Admission</Button>
                <Button sx={{ mt: "0.5rem", flex: 1, backgroundColor: "rgba(246, 247, 248, 0.4)", border: "1px solid rgba(232, 234, 238, 0.5)", textAlign: "left", "&.MuiButton-root": { height: "42px", justifyContent: "flex-start", padding: "12px", color: "rgb(0, 107, 214)" }, "&.MuiButton-root:hover": { border: "1px solid var(--bs-primary)" }, "--Button-gap": "14px" }} color="primary" variant="outlined" size="sm" startDecorator={<Bubble color="rgb(0, 115, 230)" opacity="0.6" size="20" />}>Admission Enquiry</Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Sheet>
    </Modal>
  );
}

export default SearchDialog;
