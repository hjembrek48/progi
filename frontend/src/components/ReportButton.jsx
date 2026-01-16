import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { FaFlag } from "react-icons/fa";
import apiAuth from "../services/apiAuth";

export function ReportButton({ listingId, className = "" }) {
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please provide a description");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await apiAuth.post("reports/", {
        target_listing: listingId,
        description: description,
      });
      alert("Report submitted successfully");
      setDescription("");
      setShowModal(false);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.response?.data?.description?.[0] || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="danger"
        size="md"
        onClick={() => setShowModal(true)}
        className={className}
      >
        <FaFlag /> Report
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report Listing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe why you're reporting this listing..."
                disabled={loading}
              />
            </Form.Group>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
