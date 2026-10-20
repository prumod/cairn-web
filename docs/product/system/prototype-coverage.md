# Interactive prototype coverage

This is the traceability map for the current unstyled wireframe. The priority names below are documentation references only. The application does not display those labels. Capability identifiers follow the [identifier mapping](../README.md#correspondência-de-identificadores) after transcription 4. Transcription 3 changed identifiers only; transcription 4 changed the map, opportunity detail, filters and result list.

## Discovery

| Capability | Screen or interaction                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N01        | Company profile edits the reference location, search radius, class and licences.                                                                                                                              |
| N02        | Opportunity search filters fictional examples by publication date, radius and text. The empty result can be corrected.                                                                                        |
| N03        | Opportunity screen switches between a schematic map and a list. The map has one marker per locality, sized by its number of opportunities, not value. Selecting a marker lists that locality's opportunities. |
| N04        | Selected opportunity shows the buyer, description, announced value, location, work duration, delivery deadline, mandatory site visit (or missing information), platform and fictional notice preview.         |
| N13        | Assisted search returns a deterministic fictional answer with links to the example opportunity list and stated source limits.                                                                                 |
| N14        | Partly covered by N02: publication date, radius and text. Filters for value, deadline and work type, and priority categories, are not implemented.                                                            |

## Later capabilities

L09–L16 belong to proposal preparation, not work execution. L10–L16 were moved from Now after transcription 3; their existing demonstrations remain. This documentation change does not verify or change the current frontend.

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
| L09        | Proposal screen marks the financial schedule as required or not required and records its prepared state. This capability is deferred from Now to Later.                  |
| L10        | Deadline screen sorts fixed example dates and labels upcoming and expired delivery dates.                                                                                |
| L11        | Invitation screen records a local intention to participate or not. No mailbox or external procedure is opened.                                                           |
| L12        | Opportunity detail compares the fictional requirements with the company profile and records a local participation decision. The review does not certify eligibility.     |
| L13        | Proposal screen opens bundled fictional document previews.                                                                                                               |
| L14        | Proposal checklist marks required documents as prepared or missing.                                                                                                      |
| L15        | Proposal price table edits unit prices and calculates subtotals and total. Missing prices block review.                                                                  |
| L16        | Proposal review lists omissions, checks the fixed deadline, returns to preparation and simulates submission without sending documents.                                   |
| L17        | Not implemented. The assistant does not navigate the application.                                                                                                        |
| L18        | Not implemented. No phase-grouped view exists.                                                                                                                           |
| L19        | Opportunity filters select one buyer or all buyers; the map and list update. The empty-result recovery clears this filter.                                               |

## Capabilities to evaluate

| Capability | Screen or interaction                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M01        | Planning screen shows task bars, dates, dependencies, resource assignments and a fixed illustrative completion estimate.                                             |
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
| M13        | Not implemented.                                                                                                                                                     |
| M14        | Not implemented.                                                                                                                                                     |
| M15        | Not implemented.                                                                                                                                                     |
| M16        | Opportunity results simulate an Excel export of the filtered list as a text preview. An empty list shows a message instead. No file is downloaded.                   |

## Excluded capabilities

X01–X03 have no screens by design.

## Prototype limits

- Examples and dates are fictional and fixed. The current reference date is 1 October 2026.
- React state stays in memory. Refreshing or using the reset control restores the examples.
- The app has no backend, database, authentication, real file input, outbound request, mailbox access or external integration.
- A simulated submission always states that no document was sent.
- SVG diagrams encode geometry and interaction only. The app has no presentation stylesheet or visual library.
- Demonstration calculations do not establish legal, procurement or accounting rules.

## Review status

Before transcription 3, all 32 documented capabilities mapped to an implemented screen or interaction. Of the 40 capabilities documented now, N14 is partly covered and L17, L18 and M13–M15 are not covered. The transcription 4 changes (N03, N04, L19 and M16) passed typecheck but have not had a browser pass. An earlier browser smoke pass visited all 21 task screens at a 390-pixel viewport; none caused horizontal page overflow. The smoke pass also exercised empty-search recovery, proposal preparation, simulated submission and reset. Axe reported no violations on the opportunity map, proposal screen, Gantt screen and initial page. Axe could not determine contrast for some text inside the SVG diagrams.

`bun run check`, changed-file formatting and `git diff --check` passed. The browser smoke test does not prove that every workflow or the user experience is complete.
