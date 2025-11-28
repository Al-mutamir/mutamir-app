import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type StepStatus = "completed" | "current" | "pending"

export interface Step {
  id: number
  title: string
  status: StepStatus
}

interface StepperProps {
  steps: Step[]
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function Stepper({ steps, orientation = "horizontal", className }: StepperProps) {
  if (orientation === "vertical") {
    return <VerticalStepper steps={steps} className={className} />
  }

  return <HorizontalStepper steps={steps} className={className} />
}

function HorizontalStepper({ steps, className }: Omit<StepperProps, "orientation">) {
  return (
    <div className={cn("w-full flex justify-center", className)}>
      <div className="relative flex items-center justify-between gap-8" style={{ maxWidth: "600px", width: "100%" }}>
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center flex-1">
            {/* Step connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-1/2 h-[2px] -translate-y-1/2 left-[calc(50%+40px)] right-[-calc(50%+40px)]",
                  step.status === "completed" ? "bg-primary" : "bg-gray-200",
                )}
              />
            )}

            {/* Step circle */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium",
                step.status === "completed"
                  ? "bg-primary text-white border-primary"
                  : step.status === "current"
                    ? "bg-white text-primary border-primary"
                    : "bg-white text-gray-400 border-gray-200",
              )}
            >
              {step.status === "completed" ? <Check className="h-5 w-5" /> : step.id}
            </div>

            {/* Step info */}
            <div className="mt-2 text-center">
              <div className="text-xs uppercase font-medium text-gray-500">STEP {step.id}</div>
              <div className="font-semibold">{step.title}</div>
              <div
                className={cn(
                  "inline-block px-2 py-1 rounded-full text-xs mt-1",
                  step.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : step.status === "current"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-500",
                )}
              >
                {step.status === "completed" ? "Completed" : step.status === "current" ? "In Progress" : "Pending"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VerticalStepper({ steps, className }: Omit<StepperProps, "orientation">) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex flex-col">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start mb-8 last:mb-0">
            <div className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-10 left-1/2 -translate-x-1/2 w-[2px] h-full",
                    step.status === "completed" ? "bg-primary" : "bg-gray-200",
                  )}
                />
              )}

              {/* Step circle */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium",
                  step.status === "completed"
                    ? "bg-primary text-white border-primary"
                    : step.status === "current"
                      ? "bg-white text-primary border-primary"
                      : "bg-white text-gray-400 border-gray-200",
                )}
              >
                {step.status === "completed" ? <Check className="h-5 w-5" /> : step.id}
              </div>
            </div>

            {/* Step info */}
            <div className="ml-4">
              <div className="text-xs uppercase font-medium text-gray-500">STEP {step.id}</div>
              <div className="font-semibold">{step.title}</div>
              <div
                className={cn(
                  "inline-block px-2 py-1 rounded-full text-xs mt-1",
                  step.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : step.status === "current"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-500",
                )}
              >
                {step.status === "completed" ? "Completed" : step.status === "current" ? "In Progress" : "Pending"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
