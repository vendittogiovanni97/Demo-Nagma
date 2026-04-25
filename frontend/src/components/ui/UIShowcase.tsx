"use client";

import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import Button from "./Button";
import Input from "./Input";
import Card from "./Card";
import Modal from "@/components/modals/Modal";
import Toast from "./Toast/Toast";
import Form, { FormField } from "./Form/Form";

/**
 * UI Showcase - Dimostrazione di tutti i componenti UI
 * Utilizzo: <UIShowcase /> in una pagina di sviluppo
 */

export default function UIShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    agree: false,
    notifications: true,
  });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleShowToast = (severity: typeof toastSeverity) => {
    setToastSeverity(severity);
    setToastOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography variant="h1" sx={{ marginBottom: 4, color: "#00BFFF" }}>
        UI Components Showcase
      </Typography>

      {/* Buttons Section */}
      <Box sx={{ marginBottom: 6 }}>
        <Typography variant="h4" sx={{ marginBottom: 2, color: "#ffffff" }}>
          Buttons
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="primary" size="sm">
            Primary Small
          </Button>
          <Button variant="primary" size="md">
            Primary Medium
          </Button>
          <Button variant="primary" size="lg">
            Primary Large
          </Button>
          <Button variant="secondary" size="md">
            Secondary
          </Button>
          <Button variant="ghost" size="md">
            Ghost
          </Button>
          <Button variant="primary" size="md" disabled>
            Disabled
          </Button>
          <Button variant="primary" size="md" isLoading>
            Loading
          </Button>
          <Button variant="primary" size="md" fullWidth>
            Full Width
          </Button>
        </Box>
      </Box>

      {/* Inputs Section */}
      <Box sx={{ marginBottom: 6 }}>
        <Typography variant="h4" sx={{ marginBottom: 2, color: "#ffffff" }}>
          Inputs
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
          <Input
            label="Email"
            type="email"
            value={formValues.email}
            onChange={(value) =>
              setFormValues({ ...formValues, email: value })
            }
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={formValues.password}
            onChange={(value) =>
              setFormValues({ ...formValues, password: value })
            }
          />
          <Input
            label="With Error"
            value=""
            onChange={() => {}}
            error="This field is required"
          />
          <Input
            label="Disabled"
            value="Cannot edit"
            onChange={() => {}}
            disabled
          />
        </Box>
      </Box>

      {/* Cards Section */}
      <Box sx={{ marginBottom: 6 }}>
        <Typography variant="h4" sx={{ marginBottom: 2, color: "#ffffff" }}>
          Cards
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2 }}>
          <Card variant="glass">
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Glass Card
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d1d1" }}>
              This is a glass-style card with subtle border
            </Typography>
          </Card>

          <Card variant="primary">
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Primary Card
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d1d1", mb: 2 }}>
              With header
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d1d1" }}>
              Primary styled card content
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="primary" size="sm">
                Action
              </Button>
            </Box>
          </Card>

          <Card variant="elevated" interactive>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Interactive Card
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d1d1" }}>
              Click this card - it has hover effects
            </Typography>
          </Card>
        </Box>
      </Box>

      {/* Modal Section */}
      <Box sx={{ marginBottom: 6 }}>
        <Typography variant="h4" sx={{ marginBottom: 2, color: "#ffffff" }}>
          Modal/Dialog
        </Typography>
        <Button variant="primary" onClick={handleOpenModal}>
          Open Modal
        </Button>

        <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Dialog Example">
          <Typography variant="body2" sx={{ color: "#d1d1d1", lineHeight: 1.8 }}>
            This is the modal content. You can add any content here. Click the
            close button or click outside to dismiss.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="secondary" size="sm" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCloseModal}>
              Confirm
            </Button>
          </Box>
        </Modal>
      </Box>

      {/* Toast Section */}
      <Box sx={{ marginBottom: 6 }}>
        <Typography variant="h4" sx={{ marginBottom: 2, color: "#ffffff" }}>
          Toast Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="success" onClick={() => handleShowToast("success")}>
            Show Success
          </Button>
          <Button variant="danger" onClick={() => handleShowToast("error")}>
            Show Error
          </Button>
          <Button onClick={() => handleShowToast("warning")}>
            Show Warning
          </Button>
          <Button variant="ghost" onClick={() => handleShowToast("info")}>
            Show Info
          </Button>
        </Box>

        {toastOpen && (
          <Box sx={{ marginTop: 2 }}>
            <Toast
              severity={toastSeverity}
              message={`This is a ${toastSeverity} notification!`}
              onClose={() => setToastOpen(false)}
              autoCloseDuration={5000}
            />
          </Box>
        )}
      </Box>

      {/* Form Section */}
      <Box sx={{ marginBottom: 6 }}>
        <Typography variant="h4" sx={{ marginBottom: 2, color: "#ffffff" }}>
          Form Components
        </Typography>
        <Box sx={{ maxWidth: 400 }}>
          <Form>
            <FormField
              type="checkbox"
              label="I agree to terms and conditions"
              name="agree"
              value={formValues.agree}
              onChange={(value) =>
                setFormValues({ ...formValues, agree: value as boolean })
              }
            />

            <FormField
              type="switch"
              label="Enable notifications"
              name="notifications"
              value={formValues.notifications}
              onChange={(value) =>
                setFormValues({ ...formValues, notifications: value as boolean })
              }
            />

            <Box sx={{ marginTop: 2 }}>
              <Button variant="primary" fullWidth>
                Submit
              </Button>
            </Box>
          </Form>
        </Box>
      </Box>
    </Container>
  );
}
