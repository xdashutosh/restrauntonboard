import { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Autocomplete,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import PhotoUpload from './PhotoUpload';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setRestaurant } from '@/store/restaurantSlice';
import type { InsertRestaurant, WorkingDays } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const INDIAN_STATIONS = [
  'Mumbai Central',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  // Add more stations...
];

const steps = ['Basic Details', 'Photos', 'Contact Details', 'Working Hours', 'Documents'];

export default function RegistrationSteps() {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { control, handleSubmit, watch, setValue } = useForm<InsertRestaurant>({
    defaultValues: {
      workingDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      } as WorkingDays,
      documents: {
        gst: '',
        fssai: '',
        idProof: '',
        addressProof: '',
      },
      isOnline: true,
    }
  });
  const sameAsPhone = watch('mobileNumber') === watch('whatsappNumber');

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = (data: InsertRestaurant) => {
    dispatch(setRestaurant(data as any));
    toast({
      title: "Success",
      description: "Restaurant registered successfully"
    });
    setLocation('/dashboard');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Restaurant Name"
                  margin="normal"
                />
              )}
            />
            <Controller
              name="ownerName"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Owner Name"
                  margin="normal"
                />
              )}
            />
            <Controller
              name="location"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={INDIAN_STATIONS}
                  renderInput={(params) => (
                    <TextField {...params} label="Station Location" margin="normal" />
                  )}
                  onChange={(_, value) => field.onChange(value)}
                />
              )}
            />
            <Controller
              name="minOrderAmount"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Minimum Order Amount"
                  type="number"
                  margin="normal"
                />
              )}
            />
          </Box>
        );
      case 1:
        return (
          <Controller
            name="photos"
            control={control}
            render={({ field }) => (
              <PhotoUpload
                value={field.value}
                onChange={field.onChange}
                max={4}
              />
            )}
          />
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                />
              )}
            />
            <Controller
              name="mobileNumber"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mobile Number"
                  type="tel"
                  margin="normal"
                />
              )}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAsPhone}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Set whatsapp number same as mobile
                      control.setValue('whatsappNumber', watch('mobileNumber'));
                    }
                  }}
                />
              }
              label="Same as WhatsApp"
            />
            {!sameAsPhone && (
              <Controller
                name="whatsappNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="WhatsApp Number"
                    type="tel"
                    margin="normal"
                  />
                )}
              />
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Controller
              name="workingDays"
              control={control}
              defaultValue={{
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false,
              } as WorkingDays}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={(e) => {
                          const newValue = {
                            monday: e.target.checked,
                            tuesday: e.target.checked,
                            wednesday: e.target.checked,
                            thursday: e.target.checked,
                            friday: e.target.checked,
                            saturday: e.target.checked,
                            sunday: e.target.checked,
                          };
                          field.onChange(newValue);
                        }}
                      />
                    }
                    label="Select All"
                  />
                  {Object.entries(field.value || {}).map(([day, checked]) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) => {
                            field.onChange({
                              ...(field.value || {}),
                              [day]: e.target.checked,
                            });
                          }}
                        />
                      }
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                    />
                  ))}
                </FormGroup>
              )}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Controller
                  name="openingTime"
                  control={control}
                  render={({ field }) => (
                    <MobileTimePicker
                      label="Opening Time"
                      value={field.value ? new Date(`2024-01-01T${field.value}`) : null}
                      onChange={(newValue) => {
                        const timeString = newValue?.toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        field.onChange(timeString);
                      }}
                    />
                  )}
                />
                <Controller
                  name="closingTime"
                  control={control}
                  render={({ field }) => (
                    <MobileTimePicker
                      label="Closing Time"
                      value={field.value ? new Date(`2024-01-01T${field.value}`) : null}
                      onChange={(newValue) => {
                        const timeString = newValue?.toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        field.onChange(timeString);
                      }}
                    />
                  )}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Controller
              name="documents"
              control={control}
              defaultValue={{
                gst: '',
                fssai: '',
                idProof: '',
                addressProof: '',
              }}
              render={({ field: { value, onChange } }) => (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Upload Documents
                  </Typography>
                  <PhotoUpload
                    value={value?.gst || ''}
                    onChange={(newValue) =>
                      onChange({ ...value, gst: newValue as string })
                    }
                    label="GST Certificate"
                    max={1}
                  />
                  <PhotoUpload
                    value={value?.fssai || ''}
                    onChange={(newValue) =>
                      onChange({ ...value, fssai: newValue as string })
                    }
                    label="FSSAI License"
                    max={1}
                  />
                  <PhotoUpload
                    value={value?.idProof || ''}
                    onChange={(newValue) =>
                      onChange({ ...value, idProof: newValue as string })
                    }
                    label="ID Proof"
                    max={1}
                  />
                  <PhotoUpload
                    value={value?.addressProof || ''}
                    onChange={(newValue) =>
                      onChange({ ...value, addressProof: newValue as string })
                    }
                    label="Address Proof"
                    max={1}
                  />
                </Box>
              )}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              type="submit"
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
}