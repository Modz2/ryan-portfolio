# Sentinel IDS

> An anomaly-based network intrusion detection system that classifies live
> traffic with machine learning instead of relying on static signatures.

**Domain:** ML · Network Security  ·  **Stack:** Python, Scapy, scikit-learn, pandas  ·  **Role:** Solo  ·  **Year:** 2026

---

## Threat model

Signature-based intrusion detection only catches attacks someone has already
catalogued. Novel, polymorphic, or lightly obfuscated attacks walk straight
past it. Sentinel instead models what *normal* traffic looks like for a network
and flags statistically significant deviations — so it can surface a
zero-day-shaped anomaly that no rule describes, while keeping false positives
low enough that an analyst will actually trust the alerts.

## What it does

1. **Capture** — sniffs packets off an interface with Scapy (or reads a PCAP).
2. **Flow assembly** — groups packets into bidirectional flows keyed by the
   5-tuple (src/dst IP, src/dst port, protocol).
3. **Feature extraction** — computes a per-flow feature vector: duration,
   forward/backward byte and packet counts and ratios, TCP flag distributions,
   and inter-arrival-time statistics — matched to the CIC-IDS2017 feature set.
4. **Classification** — a gradient-boosted tree model scores each flow and
   labels it benign or by attack class (DoS, port scan, brute force, botnet).
5. **Alerting** — flagged flows are reported with their top contributing
   features (via SHAP) so the alert is explainable, not a black box.

## Design decisions

- **Flow-level, not packet-level.** Classifying individual packets loses
  connection context and buries you in volume. Flows capture the *shape* of a
  conversation, which is where attack behaviour actually shows up.
- **Train/serve feature parity.** The live extractor computes exactly the same
  features, the same way, as the training pipeline. Feature skew between
  training and production is the quiet killer of deployed ML, so this was
  non-negotiable.
- **Honest validation.** Time-based splits prevent the model from "peeking"
  at future traffic during evaluation, which otherwise inflates metrics.
- **Recall over accuracy.** Attacks are a tiny fraction of traffic; raw
  accuracy is meaningless. I used stratified sampling and tuned the decision
  threshold for recall on minority classes.

## Results

- ~0.98 macro-F1 on a held-out, time-separated split.
- The real work was false-positive reduction: large legitimate file transfers
  initially tripped the exfiltration class until the validation harness and
  feature normalization were fixed.

## What I'd do next

Move from batch retraining to **online learning**, so the model adapts to a
specific network's evolving baseline instead of a fixed training set. I'd also
add a streaming feature store so detection latency stays constant under load.

## What I learned

Deployed ML lives or dies on data discipline, not model choice. The classifier
was the easy part; getting training and production to see the same world, and
making alerts explainable enough to trust, was the engineering.
