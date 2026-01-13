import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import Swal from 'sweetalert2'

/**
 * Service to handle data exports in various formats
 */
export const exportService = {
    /**
     * Export data to PDF format
     * @param {Array} items - The array of objects to export
     * @param {Object} options - Export options (title, fileName, columns)
     */
    exportToPDF: async (items, { title = 'Report', fileName = 'export', columns = [] }) => {
        try {
            // Use landscape orientation for better horizontal space
            const doc = jsPDF({ orientation: 'landscape' })
            const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm')

            // Add Church/App Header
            doc.setFontSize(22)
            doc.setTextColor(118, 75, 162) // Theme Purple
            doc.text("POTTER'S CATHEDRAL", 14, 20)

            doc.setFontSize(14)
            doc.setTextColor(17, 24, 39) // Dark Gray
            doc.text(title, 14, 28)

            doc.setFontSize(10)
            doc.setTextColor(107, 114, 128) // Muted Gray
            doc.text(`Generated on: ${timestamp}`, 14, 34)

            // Prepare columns: Add "No." and "Photo" at the start
            const tableColumn = ['No.', 'Photo', ...columns.map(col => col.header)]

            const tableRows = items.map((item, index) => [
                index + 1,
                '', // Placeholder for Photo
                ...columns.map(col => item[col.key] || '—')
            ])

            autoTable(doc, {
                startY: 40,
                head: [tableColumn],
                body: tableRows,
                headStyles: {
                    fillColor: [118, 75, 162], // Theme Purple
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center',
                },
                alternateRowStyles: {
                    fillColor: [249, 250, 251],
                },
                margin: { top: 40 },
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: 'linebreak',
                    valign: 'middle',
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' }, // No.
                    1: { cellWidth: 20, halign: 'center' }, // Photo
                },
                didDrawCell: (data) => {
                    // If it's the photo column and NOT the header row
                    if (data.column.index === 1 && data.cell.section === 'body') {
                        const rowIndex = data.row.index
                        const avatar = items[rowIndex]?.avatar

                        if (avatar && avatar.startsWith('data:image')) {
                            const cellX = data.cell.x + 2
                            const cellY = data.cell.y + 2
                            const dim = 12 // 12x12mm image
                            try {
                                const formatMatch = avatar.match(/^data:image\/([a-zA-Z+]+);base64,/)
                                const imageFormat = formatMatch ? formatMatch[1].toUpperCase() : 'JPEG'
                                doc.addImage(avatar, imageFormat, cellX, cellY, dim, dim)
                            } catch (e) {
                                console.error('Failed to add image to PDF cell', e)
                            }
                        }
                    }
                },
                rowPageBreak: 'avoid',
                bodyStyles: { minCellHeight: 16 }
            })

            doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
        } catch (error) {
            console.error('PDF Generation Error:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'There was an error generating your PDF. Please try again.',
                confirmButtonColor: '#ef4444',
            })
        }
    },

    /**
     * Export data to Excel format
     * @param {Array} data - The array of objects to export
     * @param {Object} options - Export options (fileName, columns)
     */
    exportToExcel: (data, { fileName = 'export', columns = [] }) => {
        const formattedData = data.map(item => {
            const row = {}
            columns.forEach(col => {
                row[col.header] = item[col.key] || ''
            })
            return row
        })

        const worksheet = XLSX.utils.json_to_sheet(formattedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members')
        XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`)
    },

    /**
     * Export data to CSV format
     * @param {Array} data - The array of objects to export
     * @param {Object} options - Export options (fileName, columns)
     */
    exportToCSV: (data, { fileName = 'export', columns = [] }) => {
        const headers = columns.map(col => `"${col.header}"`).join(',')
        const rows = data.map(item =>
            columns.map(col => {
                const val = item[col.key] || ''
                return `"${val.toString().replace(/"/g, '""')}"`
            }).join(',')
        ).join('\n')

        const csvContent = `${headers}\n${rows}`
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    },
}
