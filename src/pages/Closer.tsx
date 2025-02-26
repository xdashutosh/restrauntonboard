import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  TextareaAutosize,
} from "@mui/material";
import { CalendarMonth, Schedule } from "@mui/icons-material";

const Closer = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleDayChange = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        p: 3,
        boxShadow: "none",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Schedule Closer */}
      <Typography
        variant="h6"
        sx={{ display: "flex", alignItems: "center", gap: 1, color: "#A85E43", fontWeight: "bold" }}
      >
        <Schedule /> Schedule Closer
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
        <FormControlLabel
          control={<Checkbox />}
          label="Select All"
        />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          {days.map((day) => (
            <FormControlLabel
              key={day}
              control={<Checkbox checked={selectedDays.includes(day)} onChange={() => handleDayChange(day)} />}
              label={day}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Select
          value={openingTime}
          onChange={(e) => setOpeningTime(e.target.value)}
          displayEmpty
          sx={{ width: "48%", bgcolor: "white", borderRadius: 1 }}
        >
          <MenuItem value="">00:00</MenuItem>
          {/* Add time options here */}
        </Select>
        <Select
          value={closingTime}
          onChange={(e) => setClosingTime(e.target.value)}
          displayEmpty
          sx={{ width: "48%", bgcolor: "white", borderRadius: 1 }}
        >
          <MenuItem value="">00:00</MenuItem>
        </Select>
      </Box>

      {/* Particular Day Closer */}
      <Typography
        variant="h6"
        sx={{ display: "flex", alignItems: "center", gap: 1, color: "#A85E43", fontWeight: "bold", mt: 3 }}
      >
        <CalendarMonth /> Particular Day Closer
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ width: "48%", bgcolor: "white", borderRadius: 1 }}
        />
        <Select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          displayEmpty
          sx={{ width: "48%", bgcolor: "white", borderRadius: 1 }}
        >
          <MenuItem value="">00:00</MenuItem>
        </Select>
      </Box>
      <TextareaAutosize
        placeholder="Enter your reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        minRows={3}
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontFamily: "Poppins, sans-serif",
        }}
      />
    </Box>
  );
};

export default Closer;
