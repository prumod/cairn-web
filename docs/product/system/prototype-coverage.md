# Interactive prototype coverage

This is the traceability map for the current unstyled wireframe. The priority names below are documentation references only. The application does not display those labels.

## Discovery and proposal

| Capability | Screen or interaction                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N01        | Company profile edits the reference location, search radius, class and licences.                                                                                     |
| N02        | Opportunity search filters fictional examples by publication date, radius and text. The empty result can be corrected.                                               |
| N03        | Opportunity screen switches between a selectable schematic map and the same results in a list.                                                                       |
| N04        | Selected opportunity shows the buyer, description, announced value, location, work duration, delivery deadline, platform and fictional notice preview.               |
| N05        | Deadline screen sorts fixed example dates and labels upcoming and expired delivery dates.                                                                            |
| N06        | Invitation screen records a local intention to participate or not. No mailbox or external procedure is opened.                                                       |
| N07        | Opportunity detail compares the fictional requirements with the company profile and records a local participation decision. The review does not certify eligibility. |
| N08        | Proposal screen opens bundled fictional document previews.                                                                                                           |
| N09        | Proposal checklist marks required documents as prepared or missing.                                                                                                  |
| N10        | Proposal price table edits unit prices and calculates subtotals and total. Missing prices block review.                                                              |
| N11        | Proposal screen marks the financial schedule as required or not required and records its prepared state.                                                             |
| N12        | Proposal review lists omissions, checks the fixed deadline, returns to preparation and simulates submission without sending documents.                               |

## Work and follow-up

| Capability | Screen or interaction                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L01        | Supplier screen searches fictional suppliers, records and compares quotations, marks a human-selected preferred supplier, and previews a simulated quotation extraction. |
| L02        | Proposal follow-up shows competitor values, report and complaint previews, post-award qualification documents, draft contract and handover record.                       |
| L03        | Works screen shows fictional works and clients and edits a local work record.                                                                                            |
| L04        | People and equipment screen records work assignments and equipment allocation without automatic resource scheduling.                                                     |
| L05        | Materials screen shows fictional per-work stock and records a local material need without placing an order.                                                              |
| L06        | Finance screen edits expenses, billed amounts and received amounts separately and answers a demonstration question from those values.                                    |
| L07        | Planning screen edits task completion and shows task dependencies, dates and a schematic Gantt.                                                                          |
| L08        | Reception and warranty screen distinguishes execution, provisional reception, warranty, inspections, repairs, retention and final reception.                             |

## Capabilities to evaluate

| Capability | Screen or interaction                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M01        | Planning screen shows task bars, dates, dependencies, resource assignments and a fixed illustrative completion estimate.                                             |
| M02        | Assisted search returns a deterministic fictional answer with links to the example opportunity list and stated source limits.                                        |
| M03        | Competitor screen compares fictional participations, values, outcomes and schematic locations. It warns that the examples do not establish fraud or source coverage. |
| M04        | Finance screen answers questions from the visible example amounts and distinguishes billed from received values.                                                     |
| M05        | Supplier screen returns fictional suppliers for a material search.                                                                                                   |
| M06        | Supplier screen previews fictional e-mail/quotation extraction and provides a failure state. It does not read email.                                                 |
| M07        | Price history screen shows fixed fictional price observations and quotation validity dates.                                                                          |
| M08        | Reference-price screen calculates a mean from entered fictional quotations and lets the user inspect a margin assumption without applying it automatically.          |
| M09        | Material forecast estimates days of stock from entered consumption and stock assumptions.                                                                            |
| M10        | Value summary shows a waterfall diagram and the same amounts in a table.                                                                                             |
| M11        | Advanced map screen edits quantities and financial-schedule percentages and previews simulated import and export outcomes.                                           |
| M12        | Contract-pattern screen shows a small fictional sample, its criteria and its limits. Repeated wins do not imply fraud.                                               |

## Prototype limits

- Examples and dates are fictional and fixed. The current reference date is 1 October 2026.
- React state stays in memory. Refreshing or using the reset control restores the examples.
- The app has no backend, database, authentication, real file input, outbound request, mailbox access or external integration.
- A simulated submission always states that no document was sent.
- SVG diagrams encode geometry and interaction only. The app has no presentation stylesheet or visual library.
- Demonstration calculations do not establish legal, procurement or accounting rules.

## Review status

All 32 documented capabilities map to an implemented screen or interaction. A browser smoke pass visited all 21 task screens at a 390-pixel viewport; none caused horizontal page overflow. The smoke pass also exercised empty-search recovery, proposal preparation, simulated submission and reset. Axe reported no violations on the opportunity map, proposal screen, Gantt screen and initial page. Axe could not determine contrast for some text inside the SVG diagrams.

`bun run check`, changed-file formatting and `git diff --check` passed. The browser smoke test does not prove that every workflow or the user experience is complete.
